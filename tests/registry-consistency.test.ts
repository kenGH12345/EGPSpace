import * as fs from 'fs';
import * as path from 'path';
import { listAllTemplates } from '../src/lib/template-registry';

describe('Template Registry Consistency', () => {
  it('ensures all registered templates have a corresponding HTML file', () => {
    const templates = listAllTemplates();
    expect(templates.length).toBeGreaterThan(0);

    const publicDir = path.resolve(__dirname, '../public/templates');

    for (const template of templates) {
      const templatePath = path.join(publicDir, template.templatePath);
      const exists = fs.existsSync(templatePath);
      
      if (!exists) {
        throw new Error(
          `Registry inconsistency: Template "${template.id}" declares path "${template.templatePath}", but the file does not exist at ${templatePath}`
        );
      }
      expect(exists).toBe(true);
    }
  });

  it('ensures no templates use the legacy v1-legacy atomVersion', () => {
    const templates = listAllTemplates();
    
    for (const template of templates) {
      // atomVersion is required to be either v2-atomic or v3-component according to the plan
      // Actually the plan says "不再允许非 v3-component 架构的残留"
      if (template.atomVersion !== 'v3-component') {
        throw new Error(
          `Registry inconsistency: Template "${template.id}" is using an outdated atomVersion: "${template.atomVersion}". Only "v3-component" is allowed.`
        );
      }
      expect(template.atomVersion).toBe('v3-component');
    }
  });
});
