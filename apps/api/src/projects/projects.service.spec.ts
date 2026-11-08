import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  const service = new ProjectsService();

  it('finds a project by slug', () => {
    expect(service.findOne('idara').title).toBe('Idara');
  });

  it('throws NotFound for an unknown slug', () => {
    expect(() => service.findOne('nope')).toThrow(NotFoundException);
  });

  it('has unique slugs', () => {
    const slugs = service.findAll().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
