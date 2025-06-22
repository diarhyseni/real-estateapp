-- Set the sequence for slug_id to start from 1003 (next number after highest existing ID)
SELECT setval('"Property_slug_id_seq"', 1002, true); 