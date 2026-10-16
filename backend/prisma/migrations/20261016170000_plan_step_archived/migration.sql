-- Archive keeps the row; a later job can delete old archived steps.
ALTER TYPE "PlanStepStatus" ADD VALUE 'archived';
