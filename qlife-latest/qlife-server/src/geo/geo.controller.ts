import { Controller, Get, Param } from '@nestjs/common';

import { GeoService } from './geo.service';

@Controller('/v1/geo')
export class GeoController {
  constructor(private readonly geo: GeoService) {}

  @Get('/districts')
  async districts() {
    return { data: { districts: await this.geo.listDistricts() } };
  }

  @Get('/districts/:districtId/upazilas')
  async upazilas(@Param('districtId') districtId: string) {
    return { data: { upazilas: await this.geo.listUpazilas(districtId) } };
  }

  @Get('/upazilas/:upazilaId/unions')
  async unions(@Param('upazilaId') upazilaId: string) {
    return { data: { unions: await this.geo.listUnions(upazilaId) } };
  }
}

