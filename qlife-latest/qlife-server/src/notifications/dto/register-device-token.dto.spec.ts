import { validate } from 'class-validator';

import { RegisterDeviceTokenDto } from './register-device-token.dto';

describe('RegisterDeviceTokenDto', () => {
  it('accepts a valid Android token', async () => {
    const dto = new RegisterDeviceTokenDto();
    dto.token = 'fcm-device-token-abc123';
    dto.platform = 'ANDROID';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects short tokens', async () => {
    const dto = new RegisterDeviceTokenDto();
    dto.token = 'short';
    dto.platform = 'ANDROID';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
