import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateTriageDto } from "./dto/create-triage.dto";
import { TriageQueryDto } from "./dto/triage-query.dto";
import { UpdateTriageDto } from "./dto/update-triage.dto";
import { TriageService } from "./triage.service";

@Controller("triage")
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  create(@Body() dto: CreateTriageDto) {
    return this.triageService.create(dto);
  }

  @Get()
  findAll(@Query() query: TriageQueryDto) {
    return this.triageService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.triageService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTriageDto) {
    return this.triageService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.triageService.remove(id);
  }
}
