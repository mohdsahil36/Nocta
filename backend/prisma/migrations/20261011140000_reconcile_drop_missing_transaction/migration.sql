-- DB already missing Transaction (drift vs old migrations). Align history without reset.
DROP TABLE IF EXISTS "Transaction";
