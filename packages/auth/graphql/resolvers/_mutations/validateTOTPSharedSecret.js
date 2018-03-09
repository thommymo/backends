const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { TokenTypes, validateSharedSecret } = require('../../../lib/challenges')
const { TwoFactorHasToBeDisabledError, SessionTokenValidationFailed } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user, req, ...rest }) => {
  ensureSignedIn(req)

  const {
    totp
  } = args

  const userWith2FA = {
    ...user,
    isTwoFactorEnabled: user._raw.isTwoFactorEnabled,
    TOTPChallengeSecret: user._raw.TOTPChallengeSecret,
    isTOTPChallengeSecretVerified: user._raw.isTOTPChallengeSecretVerified
  }

  if (userWith2FA.isTwoFactorEnabled) {
    throw new TwoFactorHasToBeDisabledError({ userId: user.id })
  }
  if (userWith2FA.isTOTPChallengeSecretVerified) {
    // already validated, that's fine
    return true
  }
  const type = TokenTypes.TOTP
  const validated = await validateSharedSecret({
    pgdb,
    type,
    user: userWith2FA,
    payload: totp
  })
  if (!validated) {
    throw new SessionTokenValidationFailed({ type, user, payload: totp })
  }

  return validated
}