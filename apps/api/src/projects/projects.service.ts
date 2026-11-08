import { Injectable, NotFoundException } from '@nestjs/common';
import type { Project } from './project.js';
import { projects } from './projects.data.js';

@Injectable()
export class ProjectsService {
  findAll(): Project[] {
    return projects;
  }

  findOne(slug: string): Project {
    const project = projects.find((p) => p.slug === slug);
    if (!project) throw new NotFoundException(`No project with slug "${slug}"`);
    return project;
  }
}
