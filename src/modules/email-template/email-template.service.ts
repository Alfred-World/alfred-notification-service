import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dtos/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dtos/update-email-template.dto';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private templateRepository: Repository<EmailTemplate>,
  ) {}

  async findAll(): Promise<EmailTemplate[]> {
    return this.templateRepository.find();
  }

  async findOne(code: string): Promise<EmailTemplate> {
    const template = await this.templateRepository.findOne({ where: { code } });
    if (!template) {
      throw new NotFoundException(`Template with code ${code} not found`);
    }
    return template;
  }

  async create(createDto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const newTemplate = this.templateRepository.create(createDto);
    return this.templateRepository.save(newTemplate);
  }

  async update(
    code: string,
    updateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.findOne(code);
    Object.assign(template, updateDto);
    return this.templateRepository.save(template);
  }

  async remove(code: string): Promise<void> {
    const template = await this.findOne(code);
    await this.templateRepository.remove(template);
  }
}
