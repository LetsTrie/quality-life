"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BackLink } from "@/components/detail-bits";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, type AdminInstrumentDetail } from "@/lib/api";
import { humanize } from "@/lib/utils";

const CATEGORIES = ["PRIMARY_SCREENING", "WELLBEING_INDEX", "RISK_PROFILE", "CLINICAL_ASSESSMENT"];
const SCORING_METHODS = ["SUM", "WEIGHTED_SUM", "AVERAGE", "NORMALIZED_PERCENT", "NONE"];
const ACTIONS = ["SHOW_RESULT", "RECOMMEND_CONTENT", "SHOW_HELP_CENTER", "SHOW_HELP_CENTER_URGENT", "NONE"];

type OptDraft = { label: string; value: string; weight: string };
type QDraft = { prompt: string; domain: string; isReverseScored: boolean; options: OptDraft[] };
type BandDraft = {
  label: string;
  severityRank: string;
  minScore: string;
  maxScore: string;
  colorHex: string;
  advice: string;
  recommendedAction: string;
  recommendedContentId: string;
};

const NONE_CONTENT = "__none__";

function blankOption(): OptDraft {
  return { label: "", value: "0", weight: "0" };
}
function blankQuestion(): QDraft {
  return { prompt: "", domain: "", isReverseScored: false, options: [blankOption(), blankOption()] };
}
function blankBand(): BandDraft {
  return {
    label: "",
    severityRank: "0",
    minScore: "0",
    maxScore: "0",
    colorHex: "",
    advice: "",
    recommendedAction: "SHOW_RESULT",
    recommendedContentId: NONE_CONTENT,
  };
}

export default function ScaleEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [contentOptions, setContentOptions] = useState<{ id: string; title: string }[]>([]);

  // Metadata
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("PRIMARY_SCREENING");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSelfAssessable, setIsSelfAssessable] = useState(true);
  // Scoring
  const [scoringMethod, setScoringMethod] = useState("WEIGHTED_SUM");
  const [normalizationMax, setNormalizationMax] = useState("");
  const [attribution, setAttribution] = useState("");
  const [instructions, setInstructions] = useState("");
  // Content
  const [questions, setQuestions] = useState<QDraft[]>([blankQuestion()]);
  const [bands, setBands] = useState<BandDraft[]>([blankBand()]);

  const load = useCallback(async () => {
    try {
      const contentList = await api<{ id: string; title: string }[]>("/v1/admin/content");
      setContentOptions(contentList);
      if (!id) return;
      const s = await api<AdminInstrumentDetail>(`/v1/admin/instruments/${id}`);
      setName(s.name);
      setNameBn(s.nameBn ?? "");
      setSlug(s.slug);
      setCategory(s.category);
      setDescription(s.description ?? "");
      setIsActive(s.isActive);
      setIsSelfAssessable(s.isSelfAssessable);
      setResponseCount(s.responseCount);
      if (s.version) {
        setScoringMethod(s.version.scoringMethod);
        setNormalizationMax(s.version.normalizationMax?.toString() ?? "");
        setAttribution(s.version.attribution ?? "");
        setInstructions(s.version.instructions ?? "");
      }
      setQuestions(
        s.questions.length
          ? s.questions.map((q) => ({
              prompt: q.prompt,
              domain: q.domain ?? "",
              isReverseScored: q.isReverseScored,
              options: q.options.map((o) => ({
                label: o.label,
                value: String(o.value),
                weight: String(o.weight ?? 0),
              })),
            }))
          : [blankQuestion()],
      );
      setBands(
        s.bands.map((b) => ({
          label: b.label,
          severityRank: String(b.severityRank),
          minScore: String(b.minScore ?? 0),
          maxScore: String(b.maxScore ?? 0),
          colorHex: b.colorHex ?? "",
          advice: b.advice ?? "",
          recommendedAction: b.recommendedAction,
          recommendedContentId: b.recommendedContentId ?? NONE_CONTENT,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load scale");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function validate(): string | null {
    if (!name.trim()) return "Name is required.";
    if (!isEdit && !slug.trim()) return "Slug is required.";
    if (questions.length === 0) return "Add at least one question.";
    for (const [qi, q] of questions.entries()) {
      if (!q.prompt.trim()) return `Question ${qi + 1}: prompt is required.`;
      if (q.options.length < 2) return `Question ${qi + 1}: add at least two answers.`;
      for (const [oi, o] of q.options.entries()) {
        if (!o.label.trim()) return `Question ${qi + 1}, answer ${oi + 1}: label is required.`;
        if (Number.isNaN(Number(o.value))) return `Question ${qi + 1}, answer ${oi + 1}: value must be a number.`;
        if (Number.isNaN(Number(o.weight))) return `Question ${qi + 1}, answer ${oi + 1}: weight must be a number.`;
      }
    }
    if (scoringMethod === "NORMALIZED_PERCENT" && (!normalizationMax.trim() || Number(normalizationMax) <= 0)) {
      return "Normalization max is required for normalized-percent scoring.";
    }
    for (const [bi, b] of bands.entries()) {
      if (!b.label.trim()) return `Band ${bi + 1}: label is required.`;
      if (Number(b.minScore) > Number(b.maxScore)) return `Band ${bi + 1}: min score exceeds max score.`;
    }
    return null;
  }

  async function save() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(isEdit ? {} : { slug: slug.trim() }),
        name: name.trim(),
        nameBn: nameBn.trim() || undefined,
        category,
        description: description.trim() || undefined,
        isActive,
        isSelfAssessable,
        scoringMethod,
        normalizationMax:
          scoringMethod === "NORMALIZED_PERCENT" ? Number(normalizationMax) : undefined,
        attribution: attribution.trim() || undefined,
        instructions: instructions.trim() || undefined,
        questions: questions.map((q) => ({
          prompt: q.prompt.trim(),
          domain: q.domain.trim() || undefined,
          isReverseScored: q.isReverseScored,
          options: q.options.map((o) => ({
            label: o.label.trim(),
            value: Number(o.value),
            weight: Number(o.weight),
          })),
        })),
        bands: bands.map((b) => ({
          label: b.label.trim(),
          severityRank: Number(b.severityRank),
          minScore: Number(b.minScore),
          maxScore: Number(b.maxScore),
          colorHex: b.colorHex.trim() || undefined,
          advice: b.advice.trim() || undefined,
          recommendedAction: b.recommendedAction,
          recommendedContentId:
            b.recommendedContentId && b.recommendedContentId !== NONE_CONTENT
              ? b.recommendedContentId
              : undefined,
        })),
      };

      const res = await api<{ id: string; versionNumber: number; newVersionCreated: boolean }>(
        isEdit ? `/v1/admin/instruments/${id}` : "/v1/admin/instruments",
        { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      toast.success(
        res.newVersionCreated
          ? `Saved — published version ${res.versionNumber}.`
          : "Scale saved.",
      );
      router.push(`/scales/detail?id=${res.id}`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // --- array update helpers ---
  const setQ = (i: number, patch: Partial<QDraft>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const setOpt = (qi: number, oi: number, patch: Partial<OptDraft>) =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) }
          : q,
      ),
    );
  const setBand = (i: number, patch: Partial<BandDraft>) =>
    setBands((bs) => bs.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  if (loading) {
    return (
      <div className="space-y-4">
        <BackLink href="/scales" label="Back to scales" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <BackLink href={isEdit ? `/scales/detail?id=${id}` : "/scales"} label="Back" />
      <PageHeader
        title={isEdit ? "Edit scale" : "New scale"}
        subtitle="Define questions, weighted answers, score ranges, and the action for each range."
      >
        <Button variant="brand" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </PageHeader>

      {isEdit && responseCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
          <span>
            This scale already has <strong>{responseCount}</strong> recorded response(s). Saving
            will publish a <strong>new version</strong>; past responses keep their original scoring.
          </span>
        </div>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name (English)">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Name (Bangla)">
            <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
          </Field>
          <Field label="Slug" hint={isEdit ? "Immutable" : "Stable key, e.g. ghq-12"}>
            <Input
              value={slug}
              disabled={isEdit}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-scale"
            />
          </Field>
          <Field label="Category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (offered to users)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isSelfAssessable}
              onChange={(e) => setIsSelfAssessable(e.target.checked)}
            />
            Self-assessable (users can take it directly)
          </label>
        </CardContent>
      </Card>

      {/* Scoring */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Scoring method">
            <Select value={scoringMethod} onValueChange={setScoringMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCORING_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{humanize(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {scoringMethod === "NORMALIZED_PERCENT" && (
            <Field label="Normalization max" hint="Raw score is scaled to a % of this">
              <Input
                type="number"
                value={normalizationMax}
                onChange={(e) => setNormalizationMax(e.target.value)}
              />
            </Field>
          )}
          <Field label="Attribution" className="sm:col-span-2">
            <Input value={attribution} onChange={(e) => setAttribution(e.target.value)} />
          </Field>
          <Field label="Instructions" className="sm:col-span-2">
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} />
          </Field>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Questions</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}>
            <Plus className="h-4 w-4" /> Add question
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="mt-2 text-sm font-semibold text-muted-foreground">Q{qi + 1}</span>
                <div className="flex-1">
                  <Textarea
                    value={q.prompt}
                    onChange={(e) => setQ(qi, { prompt: e.target.value })}
                    placeholder="Question prompt"
                    rows={2}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== qi))}
                  aria-label="Remove question"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Domain (optional)">
                  <Input value={q.domain} onChange={(e) => setQ(qi, { domain: e.target.value })} />
                </Field>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={q.isReverseScored}
                    onChange={(e) => setQ(qi, { isReverseScored: e.target.checked })}
                  />
                  Reverse-scored
                </label>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_5rem_5rem_2.5rem] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Answer</span>
                  <span>Value</span>
                  <span>Weight</span>
                  <span />
                </div>
                {q.options.map((o, oi) => (
                  <div key={oi} className="grid grid-cols-[1fr_5rem_5rem_2.5rem] gap-2">
                    <Input value={o.label} onChange={(e) => setOpt(qi, oi, { label: e.target.value })} placeholder="Answer text" />
                    <Input value={o.value} onChange={(e) => setOpt(qi, oi, { value: e.target.value })} type="number" />
                    <Input value={o.weight} onChange={(e) => setOpt(qi, oi, { weight: e.target.value })} type="number" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuestions((qs) =>
                          qs.map((qq, idx) =>
                            idx === qi ? { ...qq, options: qq.options.filter((_, j) => j !== oi) } : qq,
                          ),
                        )
                      }
                      aria-label="Remove answer"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setQuestions((qs) =>
                      qs.map((qq, idx) => (idx === qi ? { ...qq, options: [...qq.options, blankOption()] } : qq)),
                    )
                  }
                >
                  <Plus className="h-4 w-4" /> Add answer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bands */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Score ranges & actions</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setBands((bs) => [...bs, blankBand()])}>
            <Plus className="h-4 w-4" /> Add range
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {bands.map((b, bi) => (
            <div key={bi} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Range {bi + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBands((bs) => bs.filter((_, idx) => idx !== bi))}
                  aria-label="Remove range"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Min score">
                  <Input value={b.minScore} onChange={(e) => setBand(bi, { minScore: e.target.value })} type="number" />
                </Field>
                <Field label="Max score">
                  <Input value={b.maxScore} onChange={(e) => setBand(bi, { maxScore: e.target.value })} type="number" />
                </Field>
                <Field label="Severity rank" hint="0 = least severe">
                  <Input value={b.severityRank} onChange={(e) => setBand(bi, { severityRank: e.target.value })} type="number" />
                </Field>
                <Field label="Colour (hex)">
                  <Input value={b.colorHex} onChange={(e) => setBand(bi, { colorHex: e.target.value })} placeholder="#2A8C7D" />
                </Field>
              </div>
              <Field label="Label / message shown for this range">
                <Input value={b.label} onChange={(e) => setBand(bi, { label: e.target.value })} placeholder="e.g. Mild" />
              </Field>
              <Field label="Advice message (optional)">
                <Textarea value={b.advice} onChange={(e) => setBand(bi, { advice: e.target.value })} rows={2} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Action for this range">
                  <Select value={b.recommendedAction} onValueChange={(v) => setBand(bi, { recommendedAction: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((a) => (
                        <SelectItem key={a} value={a}>{humanize(a)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Recommended resource (optional)">
                  <Select
                    value={b.recommendedContentId || NONE_CONTENT}
                    onValueChange={(v) => setBand(bi, { recommendedContentId: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_CONTENT}>None</SelectItem>
                      {contentOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label>
        {label}
        {hint && <span className="ml-2 font-normal text-muted-foreground">· {hint}</span>}
      </Label>
      {children}
    </div>
  );
}
