import { PrismaClient } from '@prisma/client';

function usage() {
  // eslint-disable-next-line no-console
  console.log(
    [
      'Usage:',
      '  ts-node --transpile-only tools/admin-verifications.ts list',
      '  ts-node --transpile-only tools/admin-verifications.ts approve <verificationId> [--admin-account-id=<uuid>] [--note=<text>]',
      '  ts-node --transpile-only tools/admin-verifications.ts reject <verificationId> [--admin-account-id=<uuid>] [--note=<text>]',
      '',
      'Requires DATABASE_URL.',
    ].join('\n'),
  );
}

function parseFlags(args: string[]) {
  const flags: Record<string, string> = {};
  for (const a of args) {
    if (!a.startsWith('--')) continue;
    const [k, ...rest] = a.slice(2).split('=');
    flags[k] = rest.join('=') ?? '';
  }
  return flags;
}

async function main() {
  const [cmd, id, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);

  if (!cmd) {
    usage();
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  try {
    if (cmd === 'list') {
      const pending = await prisma.professionalVerification.findMany({
        where: { status: 'PENDING' },
        orderBy: [{ submittedAt: 'asc' }],
        include: { professional: { select: { id: true, fullName: true, professionType: true, accountId: true } } },
        take: 50,
      });
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ pending }, null, 2));
      return;
    }

    if (cmd !== 'approve' && cmd !== 'reject') {
      usage();
      process.exitCode = 1;
      return;
    }

    if (!id) {
      usage();
      process.exitCode = 1;
      return;
    }

    const decision = cmd === 'approve' ? 'APPROVED' : 'REJECTED';
    const adminAccountId = flags['admin-account-id'] || null;
    const note = flags['note'] || null;

    const verification = await prisma.professionalVerification.findUnique({
      where: { id },
      include: { professional: true },
    });
    if (!verification) {
      // eslint-disable-next-line no-console
      console.error('Verification not found');
      process.exitCode = 1;
      return;
    }

    const updated = await prisma.professionalVerification.update({
      where: { id },
      data: {
        status: decision as any,
        reviewedByAccountId: adminAccountId,
        reviewedAt: new Date(),
        decisionNote: note,
      },
    });

    if (decision === 'APPROVED') {
      await prisma.account.update({
        where: { id: verification.professional.accountId },
        data: { status: 'ACTIVE' },
      });
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ updated }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});

