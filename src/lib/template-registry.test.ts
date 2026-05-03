import {
  getTemplate,
  getTemplateUnsafe,
  getTemplateUrl,
  isApprovedTemplate,
  listAllTemplates,
  listApprovedTemplates,
} from './template-registry';

describe('TemplateRegistry metadata guard', () => {
  it('resolves approved templates from registry metadata without a separate whitelist', () => {
    const template = getTemplate('physics/buoyancy');

    expect(template).not.toBeNull();
    expect(template?.id).toBe('physics/buoyancy');
    expect(template?.auditStatus).toBe('approved');
  });

  it('rejects pending templates', () => {
    expect(getTemplate('physics/motion')).toBeNull();
    expect(isApprovedTemplate('physics/motion')).toBe(false);
    expect(getTemplateUrl('physics/motion')).toBeNull();
  });

  it('rejects deprecated templates', () => {
    const entry = getTemplateUnsafe('physics/buoyancy');
    expect(entry).not.toBeNull();
    const previous = entry!.auditStatus;

    try {
      entry!.auditStatus = 'deprecated';
      expect(getTemplate('physics/buoyancy')).toBeNull();
      expect(isApprovedTemplate('physics/buoyancy')).toBe(false);
      expect(getTemplateUrl('physics/buoyancy')).toBeNull();
    } finally {
      entry!.auditStatus = previous;
    }
  });

  it('rejects invalid or unknown ids without throwing', () => {
    expect(getTemplate(null)).toBeNull();
    expect(getTemplate(undefined)).toBeNull();
    expect(getTemplate('')).toBeNull();
    expect(getTemplate('physics/does-not-exist')).toBeNull();
    expect(getTemplate(123 as unknown as string)).toBeNull();
  });

  it('keeps listApprovedTemplates aligned with getTemplate', () => {
    const approved = listApprovedTemplates();

    expect(approved.length).toBeGreaterThan(0);
    for (const template of approved) {
      expect(getTemplate(template.id)).toBe(template);
      expect(isApprovedTemplate(template.id)).toBe(true);
      expect(getTemplateUrl(template.id)).toBe(`/templates/${template.templatePath}`);
    }
  });

  it('keeps approved registry entries internally consistent', () => {
    const all = listAllTemplates();

    for (const template of all.filter((entry) => entry.auditStatus === 'approved')) {
      const unsafe = getTemplateUnsafe(template.id);
      expect(unsafe).toBe(template);
      expect(template.id).toBeTruthy();
      expect(template.templatePath).toBeTruthy();
      expect(template.subject).toBeTruthy();
      expect(template.auditStatus).toBe('approved');
    }
  });
});
