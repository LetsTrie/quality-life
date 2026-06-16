import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

type BuiltModule = { exports: any };

async function loadLegacyDefaultExport(entryFileAbsPath: string): Promise<unknown> {
  const result = await build({
    entryPoints: [entryFileAbsPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
  });

  const js =
    result.outputFiles?.find((f) => f.path.endsWith('.js')) ?? result.outputFiles?.[0];
  if (!js) throw new Error(`esbuild did not produce JS for ${entryFileAbsPath}`);

  const module: BuiltModule = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require: (id: string) => {
      throw new Error(`Unexpected external require(${JSON.stringify(id)}) while bundling ${entryFileAbsPath}`);
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(js.text, sandbox, { filename: entryFileAbsPath });

  const exp = module.exports;
  return exp?.default ?? exp;
}

async function main() {
  // Repo layout: this file lives in qlife-latest/qlife-server/tools/*
  const repoRoot = path.resolve(process.cwd(), '..', '..');
  const legacyDataRoot = path.join(repoRoot, 'frontend', 'App', 'data');

  const outputsDir = path.join(process.cwd(), 'prisma', 'seed-data', 'legacy');
  await mkdir(outputsDir, { recursive: true });

  const files: Array<{ in: string; out: string }> = [
    { in: path.join(legacyDataRoot, 'mentalHealthRating.js'), out: 'mental_health_rating.json' },
    { in: path.join(legacyDataRoot, 'scales', 'GHQ.js'), out: 'scale_ghq.json' },
    { in: path.join(legacyDataRoot, 'scales', 'PSS.js'), out: 'scale_pss.json' },
    { in: path.join(legacyDataRoot, 'scales', 'ANXIETY.js'), out: 'scale_anxiety.json' },
    { in: path.join(legacyDataRoot, 'scales', 'content.js'), out: 'scale_content_cards.json' },
    { in: path.join(legacyDataRoot, 'profileScales.js'), out: 'profile_scale_catalog.json' },
    { in: path.join(legacyDataRoot, 'childCare.js'), out: 'profile_child_care.json' },
    { in: path.join(legacyDataRoot, 'coronaProfile.js'), out: 'profile_corona.json' },
    { in: path.join(legacyDataRoot, 'domesticViolence.js'), out: 'profile_domestic_violence.json' },
    { in: path.join(legacyDataRoot, 'psychoticProfile.js'), out: 'profile_psychotic.json' },
    { in: path.join(legacyDataRoot, 'suicideIdeation.js'), out: 'profile_suicide_ideation.json' },
    { in: path.join(legacyDataRoot, 'profScales.js'), out: 'professional_scales.json' },
    { in: path.join(legacyDataRoot, 'helpCenter.js'), out: 'help_center.json' },
    { in: path.join(legacyDataRoot, 'videos.js'), out: 'videos.json' },
    { in: path.join(legacyDataRoot, 'RegionInformation.json'), out: 'region_information.json' }
  ];

  for (const f of files) {
    const value = await loadLegacyDefaultExport(f.in);
    const outPath = path.join(outputsDir, f.out);
    await writeFile(outPath, JSON.stringify(value, null, 2) + '\n', 'utf8');
  }

  // eslint-disable-next-line no-console
  console.log(`Wrote ${files.length} legacy seed files to ${outputsDir}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

