import 'package:flutter/material.dart';

import '../../../shared/l10n/l10n_extension.dart';
import '../../../shared/theme/app_colors.dart';
import '../../../shared/theme/app_spacing.dart';
import '../../../shared/widgets/app_components.dart';
import '../../../shared/widgets/gradient_header.dart';

/// A single (heading, body) block of a static document.
class DocSection {
  final String heading;
  final String body;
  const DocSection(this.heading, this.body);
}

/// Renders a static informational document (Privacy Policy, About Us) as a set
/// of headed sections. Content is locale-aware and currently DRAFT placeholder
/// copy — see [privacyPolicySections] / [aboutUsSections].
class InfoDocScreen extends StatelessWidget {
  final String title;
  final List<DocSection> sections;
  const InfoDocScreen({super.key, required this.title, required this.sections});

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final theme = Theme.of(context);
    return Scaffold(
      body: Column(
        children: [
          GradientHeader(title: title, showBack: true, compact: true),
          Expanded(
            child: ListView(
              padding: EdgeInsets.fromLTRB(
                AppSpacing.page,
                AppSpacing.lg,
                AppSpacing.page,
                AppSpacing.page + MediaQuery.of(context).viewPadding.bottom,
              ),
              children: [
                // DRAFT marker so it's obvious this copy is not final.
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.tertiary.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline_rounded, size: 18),
                      const Gap.horizontal(AppSpacing.sm),
                      Expanded(
                        child: Text(l.legalDraftNotice,
                            style: theme.textTheme.bodySmall),
                      ),
                    ],
                  ),
                ),
                const Gap(AppSpacing.lg),
                for (final s in sections) ...[
                  SectionHeader(s.heading),
                  Text(s.body,
                      style: theme.textTheme.bodyMedium
                          ?.copyWith(height: 1.5)),
                  const Gap(AppSpacing.lg),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Privacy Policy screen — thin wrapper that resolves locale-aware title + copy.
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final isBn = Localizations.localeOf(context).languageCode == 'bn';
    return InfoDocScreen(
      title: context.l10n.privacyTitle,
      sections: privacyPolicySections(isBn),
    );
  }
}

/// About Us screen — thin wrapper that resolves locale-aware title + copy.
class AboutUsScreen extends StatelessWidget {
  const AboutUsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final isBn = Localizations.localeOf(context).languageCode == 'bn';
    return InfoDocScreen(
      title: context.l10n.aboutTitle,
      sections: aboutUsSections(isBn),
    );
  }
}

// ---------------------------------------------------------------------------
// DRAFT placeholder content — replace before release.
// ---------------------------------------------------------------------------

List<DocSection> privacyPolicySections(bool isBn) {
  if (isBn) {
    return const [
      DocSection(
        'ভূমিকা',
        'QLife আপনার মানসিক স্বাস্থ্যের যত্নে বিশ্বাসী এবং আপনার গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়। এই নীতিতে আমরা কী তথ্য সংগ্রহ করি এবং কীভাবে তা ব্যবহার করি তা ব্যাখ্যা করা হয়েছে। (খসড়া)',
      ),
      DocSection(
        'আমরা যে তথ্য সংগ্রহ করি',
        'আমরা আপনার নাম, যোগাযোগের তথ্য, এবং আপনার দেওয়া মানসিক যাচাইয়ের উত্তর সংগ্রহ করি যাতে আপনাকে উপযুক্ত সহায়তা দেওয়া যায়। (খসড়া)',
      ),
      DocSection(
        'আমরা কীভাবে তথ্য ব্যবহার করি',
        'আপনার তথ্য শুধুমাত্র সেবা প্রদানের জন্য ব্যবহৃত হয় — যেমন উপযুক্ত পেশাদারের সাথে সংযোগ এবং যাচাইয়ের ফলাফল প্রদর্শন। আপনার সম্মতি ছাড়া আমরা তা তৃতীয় পক্ষের কাছে বিক্রি করি না। (খসড়া)',
      ),
      DocSection(
        'তথ্য নিরাপত্তা',
        'আপনার তথ্য এনক্রিপশন ও অ্যাক্সেস নিয়ন্ত্রণসহ যথাযথ নিরাপত্তা ব্যবস্থার মাধ্যমে সংরক্ষণ করা হয়। (খসড়া)',
      ),
      DocSection(
        'আপনার অধিকার',
        'আপনি যেকোনো সময় আপনার তথ্য দেখতে, সংশোধন করতে বা অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারেন। (খসড়া)',
      ),
      DocSection(
        'যোগাযোগ',
        'গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন। (খসড়া)',
      ),
    ];
  }
  return const [
    DocSection(
      'Introduction',
      'QLife supports your mental wellbeing and treats your privacy as a priority. This policy explains what information we collect and how we use it. (Draft)',
    ),
    DocSection(
      'Information we collect',
      'We collect your name, contact details, and the self-check responses you provide so we can offer you appropriate support. (Draft)',
    ),
    DocSection(
      'How we use your information',
      'Your information is used only to deliver the service — such as connecting you with a suitable professional and showing your assessment results. We do not sell it to third parties without your consent. (Draft)',
    ),
    DocSection(
      'Data security',
      'Your data is stored with appropriate safeguards including encryption and access controls. (Draft)',
    ),
    DocSection(
      'Your rights',
      'You can view or correct your information, or request account deletion, at any time. (Draft)',
    ),
    DocSection(
      'Contact us',
      'For any privacy-related questions, please contact us. (Draft)',
    ),
  ];
}

List<DocSection> aboutUsSections(bool isBn) {
  if (isBn) {
    return const [
      DocSection(
        'QLife সম্পর্কে',
        'QLife বাংলাদেশের একটি মানসিক স্বাস্থ্য প্ল্যাটফর্ম, যা মানুষকে প্রশিক্ষিত পেশাদারদের সাথে সংযুক্ত করে এবং সহজবোধ্য মানসিক যাচাইয়ের সুযোগ দেয়। (খসড়া)',
      ),
      DocSection(
        'আমাদের লক্ষ্য',
        'মানসিক স্বাস্থ্যসেবাকে সহজলভ্য, সম্মানজনক ও কলঙ্কমুক্ত করা আমাদের লক্ষ্য। (খসড়া)',
      ),
      DocSection(
        'আমরা যা করি',
        'আমরা যাচাই, সম্পদ, এবং পেশাদারদের সাথে অ্যাপয়েন্টমেন্টের ব্যবস্থা করি — সবই এক জায়গায়। (খসড়া)',
      ),
    ];
  }
  return const [
    DocSection(
      'About QLife',
      'QLife is a mental health platform for Bangladesh that connects people with trained professionals and offers easy-to-use self-checks. (Draft)',
    ),
    DocSection(
      'Our mission',
      'To make mental health care accessible, respectful, and free of stigma. (Draft)',
    ),
    DocSection(
      'What we do',
      'We bring self-checks, resources, and appointments with professionals together in one place. (Draft)',
    ),
  ];
}
