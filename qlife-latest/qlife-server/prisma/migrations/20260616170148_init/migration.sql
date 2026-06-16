-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "account_role" AS ENUM ('USER', 'PROFESSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'DELETED');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "marital_status" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'UNDISCLOSED');

-- CreateEnum
CREATE TYPE "profession_type" AS ENUM ('CLINICAL_PSYCHOLOGIST', 'ASSISTANT_CLINICAL_PSYCHOLOGIST', 'PSYCHIATRIST', 'COUNSELOR', 'OTHER');

-- CreateEnum
CREATE TYPE "professional_verification_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "weekday" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "appointment_status" AS ENUM ('REQUESTED', 'VIEWED', 'ACCEPTED', 'DECLINED', 'RESCHEDULE_PROPOSED', 'CANCELLED_BY_USER', 'CANCELLED_BY_PROFESSIONAL', 'COMPLETED', 'NO_SHOW', 'EXPIRED');

-- CreateEnum
CREATE TYPE "appointment_modality" AS ENUM ('IN_PERSON', 'VIDEO', 'PHONE', 'CHAT');

-- CreateEnum
CREATE TYPE "care_relationship_status" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "instrument_category" AS ENUM ('WELLBEING_INDEX', 'PRIMARY_SCREENING', 'RISK_PROFILE', 'CLINICAL_ASSESSMENT');

-- CreateEnum
CREATE TYPE "instrument_status" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "scoring_method" AS ENUM ('NONE', 'SUM', 'WEIGHTED_SUM', 'AVERAGE', 'NORMALIZED_PERCENT');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('SINGLE_CHOICE', 'MULTI_CHOICE', 'BOOLEAN', 'NUMERIC', 'SCALE', 'TEXT');

-- CreateEnum
CREATE TYPE "outcome_action" AS ENUM ('NONE', 'SHOW_RESULT', 'RECOMMEND_CONTENT', 'SHOW_HELP_CENTER', 'SHOW_HELP_CENTER_URGENT');

-- CreateEnum
CREATE TYPE "assessment_source" AS ENUM ('SELF_INITIATED', 'PROFESSIONAL_ASSIGNED');

-- CreateEnum
CREATE TYPE "assessment_status" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "content_type" AS ENUM ('VIDEO', 'ARTICLE', 'AUDIO', 'EXERCISE');

-- CreateEnum
CREATE TYPE "content_provider" AS ENUM ('YOUTUBE', 'VIMEO', 'INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "contact_channel" AS ENUM ('PHONE', 'WHATSAPP', 'EMAIL', 'WEBSITE', 'HOTLINE');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('APPOINTMENT_REQUESTED', 'APPOINTMENT_ACCEPTED', 'APPOINTMENT_DECLINED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_REMINDER', 'ASSESSMENT_ASSIGNED', 'ASSESSMENT_COMPLETED', 'ACCOUNT_APPROVED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS');

-- CreateEnum
CREATE TYPE "consent_type" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'DATA_PROCESSING', 'RESEARCH_USE', 'MARKETING');

-- CreateEnum
CREATE TYPE "legal_document_type" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'CONSENT_FORM');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cognito_sub" TEXT,
    "auth_provider" TEXT NOT NULL DEFAULT 'cognito',
    "email" CITEXT NOT NULL,
    "role" "account_role" NOT NULL,
    "status" "account_status" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "email_verified_at" TIMESTAMPTZ(6),
    "preferred_locale" TEXT NOT NULL DEFAULT 'bn',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "legal_document_type" NOT NULL,
    "version" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'bn',
    "title" TEXT NOT NULL,
    "content_url" TEXT,
    "effective_from" TIMESTAMPTZ(6) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "type" "consent_type" NOT NULL,
    "legal_document_id" UUID,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "method" TEXT,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "division_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upazilas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "district_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "upazilas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "upazila_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "unions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "display_name" TEXT,
    "date_of_birth" DATE,
    "gender" "gender",
    "marital" "marital_status",
    "phone" TEXT,
    "district_id" UUID,
    "upazila_id" UUID,
    "union_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "slug" TEXT,
    "full_name" TEXT NOT NULL,
    "gender" "gender",
    "profession_type" "profession_type" NOT NULL,
    "designation" TEXT,
    "bmdc_registration_no" TEXT,
    "graduation_batch" TEXT,
    "workplace" TEXT,
    "years_of_experience" INTEGER,
    "education_summary" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "fee_amount" DECIMAL(10,2),
    "fee_currency" TEXT NOT NULL DEFAULT 'BDT',
    "max_weekly_clients" INTEGER,
    "avg_weekly_clients" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "accepting_new_clients" BOOLEAN NOT NULL DEFAULT true,
    "is_onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "district_id" UUID,
    "upazila_id" UUID,
    "union_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professional_profile_id" UUID NOT NULL,
    "weekday" "weekday" NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,

    CONSTRAINT "professional_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_location_caseloads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professional_profile_id" UUID NOT NULL,
    "location_label" TEXT NOT NULL,
    "client_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "professional_location_caseloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professional_specializations" (
    "professional_profile_id" UUID NOT NULL,
    "specialization_id" UUID NOT NULL,
    "note" TEXT,

    CONSTRAINT "professional_specializations_pkey" PRIMARY KEY ("professional_profile_id","specialization_id")
);

-- CreateTable
CREATE TABLE "professional_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professional_profile_id" UUID NOT NULL,
    "status" "professional_verification_status" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by_account_id" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "decision_note" TEXT,

    CONSTRAINT "professional_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_relationships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_profile_id" UUID NOT NULL,
    "professional_profile_id" UUID NOT NULL,
    "reference_code" TEXT NOT NULL,
    "status" "care_relationship_status" NOT NULL DEFAULT 'ACTIVE',
    "established_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "ended_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "care_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_profile_id" UUID NOT NULL,
    "professional_profile_id" UUID NOT NULL,
    "care_relationship_id" UUID,
    "status" "appointment_status" NOT NULL DEFAULT 'REQUESTED',
    "modality" "appointment_modality" NOT NULL DEFAULT 'IN_PERSON',
    "requested_start_at" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_start_at" TIMESTAMPTZ(6),
    "duration_minutes" INTEGER,
    "request_message" TEXT,
    "professional_message" VARCHAR(1000),
    "meeting_link" TEXT,
    "profile_share_granted" BOOLEAN NOT NULL DEFAULT false,
    "viewed_by_professional_at" TIMESTAMPTZ(6),
    "responded_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "cancellation_reason" TEXT,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "appointment_id" UUID NOT NULL,
    "from_status" "appointment_status",
    "to_status" "appointment_status" NOT NULL,
    "actor_account_id" UUID,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "instrument_category" NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'bn',
    "status" "instrument_status" NOT NULL DEFAULT 'DRAFT',
    "scoring_method" "scoring_method" NOT NULL,
    "normalization_max" DECIMAL(10,3),
    "attribution" TEXT,
    "instructions" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "retired_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instrument_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_version_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "code" TEXT,
    "prompt" TEXT NOT NULL,
    "type" "question_type" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "is_reverse_scored" BOOLEAN NOT NULL DEFAULT false,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "domain" TEXT,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "weight" DECIMAL(6,3) NOT NULL,

    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_bands" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_version_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "severity_rank" INTEGER NOT NULL,
    "min_score" DECIMAL(10,3) NOT NULL,
    "max_score" DECIMAL(10,3) NOT NULL,
    "color_hex" TEXT,
    "advice" TEXT,
    "recommended_action" "outcome_action" NOT NULL DEFAULT 'SHOW_RESULT',
    "recommended_content_id" UUID,

    CONSTRAINT "scoring_bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subject_user_profile_id" UUID NOT NULL,
    "instrument_version_id" UUID NOT NULL,
    "source" "assessment_source" NOT NULL,
    "status" "assessment_status" NOT NULL DEFAULT 'IN_PROGRESS',
    "assigned_by_professional_id" UUID,
    "care_relationship_id" UUID,
    "raw_score" DECIMAL(10,3),
    "max_score" DECIMAL(10,3),
    "normalized_score" DECIMAL(6,3),
    "scoring_band_id" UUID,
    "severity_label" TEXT,
    "is_from_content_flow" BOOLEAN NOT NULL DEFAULT false,
    "is_post_intervention" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMPTZ(6),
    "due_at" TIMESTAMPTZ(6),
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_option_id" UUID,
    "value_numeric" DECIMAL(10,3),
    "value_text" TEXT,
    "weight_applied" DECIMAL(6,3),
    "answered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_content" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_key" TEXT NOT NULL,
    "type" "content_type" NOT NULL DEFAULT 'VIDEO',
    "provider" "content_provider" NOT NULL DEFAULT 'YOUTUBE',
    "provider_ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'bn',
    "duration_seconds" INTEGER,
    "thumbnail_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "educational_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_topics" (
    "content_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,

    CONSTRAINT "content_topics_pkey" PRIMARY KEY ("content_id","topic_id")
);

-- CreateTable
CREATE TABLE "content_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "first_viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_center_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name_bn" TEXT NOT NULL,
    "name_en" TEXT,
    "location_note" TEXT,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "help_center_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_center_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_id" UUID NOT NULL,
    "channel" "contact_channel" NOT NULL,
    "value" TEXT NOT NULL,
    "availability_note" TEXT,
    "is_toll_free" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "help_center_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_resource_topics" (
    "resource_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,

    CONSTRAINT "help_resource_topics_pkey" PRIMARY KEY ("resource_id","topic_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_account_id" UUID NOT NULL,
    "sender_account_id" UUID,
    "type" "notification_type" NOT NULL,
    "channel" "notification_channel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT,
    "body" TEXT,
    "data" JSONB,
    "appointment_id" UUID,
    "assessment_id" UUID,
    "read_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_account_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_cognito_sub_key" ON "accounts"("cognito_sub");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE INDEX "accounts_role_status_idx" ON "accounts"("role", "status");

-- CreateIndex
CREATE INDEX "accounts_deleted_at_idx" ON "accounts"("deleted_at");

-- CreateIndex
CREATE INDEX "legal_documents_type_is_current_idx" ON "legal_documents"("type", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_type_version_locale_key" ON "legal_documents"("type", "version", "locale");

-- CreateIndex
CREATE INDEX "consent_records_account_id_type_idx" ON "consent_records"("account_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_code_key" ON "divisions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "districts_code_key" ON "districts"("code");

-- CreateIndex
CREATE INDEX "districts_division_id_idx" ON "districts"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "upazilas_code_key" ON "upazilas"("code");

-- CreateIndex
CREATE INDEX "upazilas_district_id_idx" ON "upazilas"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "unions_code_key" ON "unions"("code");

-- CreateIndex
CREATE INDEX "unions_upazila_id_idx" ON "unions"("upazila_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_account_id_key" ON "user_profiles"("account_id");

-- CreateIndex
CREATE INDEX "user_profiles_district_id_idx" ON "user_profiles"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "professional_profiles_account_id_key" ON "professional_profiles"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "professional_profiles_slug_key" ON "professional_profiles"("slug");

-- CreateIndex
CREATE INDEX "professional_profiles_is_visible_accepting_new_clients_idx" ON "professional_profiles"("is_visible", "accepting_new_clients");

-- CreateIndex
CREATE INDEX "professional_profiles_profession_type_idx" ON "professional_profiles"("profession_type");

-- CreateIndex
CREATE INDEX "professional_profiles_district_id_idx" ON "professional_profiles"("district_id");

-- CreateIndex
CREATE INDEX "professional_availability_professional_profile_id_weekday_idx" ON "professional_availability"("professional_profile_id", "weekday");

-- CreateIndex
CREATE INDEX "professional_location_caseloads_professional_profile_id_idx" ON "professional_location_caseloads"("professional_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_slug_key" ON "specializations"("slug");

-- CreateIndex
CREATE INDEX "professional_specializations_specialization_id_idx" ON "professional_specializations"("specialization_id");

-- CreateIndex
CREATE INDEX "professional_verifications_professional_profile_id_status_idx" ON "professional_verifications"("professional_profile_id", "status");

-- CreateIndex
CREATE INDEX "professional_verifications_status_idx" ON "professional_verifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "care_relationships_reference_code_key" ON "care_relationships"("reference_code");

-- CreateIndex
CREATE INDEX "care_relationships_professional_profile_id_status_idx" ON "care_relationships"("professional_profile_id", "status");

-- CreateIndex
CREATE INDEX "care_relationships_user_profile_id_status_idx" ON "care_relationships"("user_profile_id", "status");

-- CreateIndex
CREATE INDEX "appointments_professional_profile_id_status_idx" ON "appointments"("professional_profile_id", "status");

-- CreateIndex
CREATE INDEX "appointments_user_profile_id_status_idx" ON "appointments"("user_profile_id", "status");

-- CreateIndex
CREATE INDEX "appointments_scheduled_start_at_idx" ON "appointments"("scheduled_start_at");

-- CreateIndex
CREATE INDEX "appointment_events_appointment_id_idx" ON "appointment_events"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "instruments_slug_key" ON "instruments"("slug");

-- CreateIndex
CREATE INDEX "instruments_category_is_active_idx" ON "instruments"("category", "is_active");

-- CreateIndex
CREATE INDEX "instrument_versions_instrument_id_status_idx" ON "instrument_versions"("instrument_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_versions_instrument_id_version_number_locale_key" ON "instrument_versions"("instrument_id", "version_number", "locale");

-- CreateIndex
CREATE INDEX "questions_instrument_version_id_idx" ON "questions"("instrument_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "questions_instrument_version_id_position_key" ON "questions"("instrument_version_id", "position");

-- CreateIndex
CREATE INDEX "answer_options_question_id_idx" ON "answer_options"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "answer_options_question_id_position_key" ON "answer_options"("question_id", "position");

-- CreateIndex
CREATE INDEX "scoring_bands_instrument_version_id_idx" ON "scoring_bands"("instrument_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "scoring_bands_instrument_version_id_position_key" ON "scoring_bands"("instrument_version_id", "position");

-- CreateIndex
CREATE INDEX "assessments_subject_user_profile_id_instrument_version_id_idx" ON "assessments"("subject_user_profile_id", "instrument_version_id");

-- CreateIndex
CREATE INDEX "assessments_assigned_by_professional_id_idx" ON "assessments"("assigned_by_professional_id");

-- CreateIndex
CREATE INDEX "assessments_care_relationship_id_idx" ON "assessments"("care_relationship_id");

-- CreateIndex
CREATE INDEX "assessments_status_idx" ON "assessments"("status");

-- CreateIndex
CREATE INDEX "assessments_completed_at_idx" ON "assessments"("completed_at");

-- CreateIndex
CREATE INDEX "assessment_answers_assessment_id_idx" ON "assessment_answers"("assessment_id");

-- CreateIndex
CREATE INDEX "assessment_answers_question_id_idx" ON "assessment_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_answers_assessment_id_question_id_selected_optio_key" ON "assessment_answers"("assessment_id", "question_id", "selected_option_id");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "educational_content_content_key_key" ON "educational_content"("content_key");

-- CreateIndex
CREATE INDEX "educational_content_is_active_display_order_idx" ON "educational_content"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "content_topics_topic_id_idx" ON "content_topics"("topic_id");

-- CreateIndex
CREATE INDEX "content_views_content_id_idx" ON "content_views"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_views_account_id_content_id_key" ON "content_views"("account_id", "content_id");

-- CreateIndex
CREATE INDEX "content_ratings_content_id_idx" ON "content_ratings"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_ratings_account_id_content_id_key" ON "content_ratings"("account_id", "content_id");

-- CreateIndex
CREATE UNIQUE INDEX "help_center_resources_slug_key" ON "help_center_resources"("slug");

-- CreateIndex
CREATE INDEX "help_center_resources_is_active_display_order_idx" ON "help_center_resources"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "help_center_contacts_resource_id_idx" ON "help_center_contacts"("resource_id");

-- CreateIndex
CREATE INDEX "help_resource_topics_topic_id_idx" ON "help_resource_topics"("topic_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_account_id_read_at_idx" ON "notifications"("recipient_account_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_account_id_idx" ON "audit_logs"("actor_account_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_legal_document_id_fkey" FOREIGN KEY ("legal_document_id") REFERENCES "legal_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upazilas" ADD CONSTRAINT "upazilas_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unions" ADD CONSTRAINT "unions_upazila_id_fkey" FOREIGN KEY ("upazila_id") REFERENCES "upazilas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_upazila_id_fkey" FOREIGN KEY ("upazila_id") REFERENCES "upazilas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_upazila_id_fkey" FOREIGN KEY ("upazila_id") REFERENCES "upazilas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "unions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_availability" ADD CONSTRAINT "professional_availability_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_location_caseloads" ADD CONSTRAINT "professional_location_caseloads_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_specializations" ADD CONSTRAINT "professional_specializations_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_specializations" ADD CONSTRAINT "professional_specializations_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_verifications" ADD CONSTRAINT "professional_verifications_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_verifications" ADD CONSTRAINT "professional_verifications_reviewed_by_account_id_fkey" FOREIGN KEY ("reviewed_by_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_relationships" ADD CONSTRAINT "care_relationships_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_relationships" ADD CONSTRAINT "care_relationships_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "professional_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professional_profile_id_fkey" FOREIGN KEY ("professional_profile_id") REFERENCES "professional_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_care_relationship_id_fkey" FOREIGN KEY ("care_relationship_id") REFERENCES "care_relationships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_events" ADD CONSTRAINT "appointment_events_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_events" ADD CONSTRAINT "appointment_events_actor_account_id_fkey" FOREIGN KEY ("actor_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_versions" ADD CONSTRAINT "instrument_versions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_instrument_version_id_fkey" FOREIGN KEY ("instrument_version_id") REFERENCES "instrument_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_bands" ADD CONSTRAINT "scoring_bands_instrument_version_id_fkey" FOREIGN KEY ("instrument_version_id") REFERENCES "instrument_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_bands" ADD CONSTRAINT "scoring_bands_recommended_content_id_fkey" FOREIGN KEY ("recommended_content_id") REFERENCES "educational_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_subject_user_profile_id_fkey" FOREIGN KEY ("subject_user_profile_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_instrument_version_id_fkey" FOREIGN KEY ("instrument_version_id") REFERENCES "instrument_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assigned_by_professional_id_fkey" FOREIGN KEY ("assigned_by_professional_id") REFERENCES "professional_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_care_relationship_id_fkey" FOREIGN KEY ("care_relationship_id") REFERENCES "care_relationships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_scoring_band_id_fkey" FOREIGN KEY ("scoring_band_id") REFERENCES "scoring_bands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "answer_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_topics" ADD CONSTRAINT "content_topics_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "educational_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_topics" ADD CONSTRAINT "content_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "educational_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_ratings" ADD CONSTRAINT "content_ratings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_ratings" ADD CONSTRAINT "content_ratings_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "educational_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_center_contacts" ADD CONSTRAINT "help_center_contacts_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "help_center_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_resource_topics" ADD CONSTRAINT "help_resource_topics_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "help_center_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_resource_topics" ADD CONSTRAINT "help_resource_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_account_id_fkey" FOREIGN KEY ("recipient_account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_account_id_fkey" FOREIGN KEY ("sender_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_account_id_fkey" FOREIGN KEY ("actor_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
