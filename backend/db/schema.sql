CREATE TABLE IF NOT EXISTS email_repository (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             TEXT NOT NULL,
    email               TEXT NOT NULL,
    email_normalized    TEXT NOT NULL,
    local_part          TEXT,
    domain              TEXT,
    status              TEXT NOT NULL DEFAULT 'unvalidated'
                        CHECK (status IN ('unvalidated','valid','invalid','risky','duplicate','inconclusive')),
    failure_reason      TEXT,
    is_role_based       INTEGER DEFAULT 0,
    is_disposable       INTEGER DEFAULT 0,
    mx_records          TEXT,
    source_batch_id     INTEGER,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_validated_at   DATETIME,
    FOREIGN KEY (source_batch_id) REFERENCES upload_batches(id),
    UNIQUE(user_id, email_normalized)
);

CREATE TABLE IF NOT EXISTS upload_batches (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT NOT NULL,
    filename        TEXT NOT NULL,
    total_rows      INTEGER DEFAULT 0,
    imported_rows   INTEGER DEFAULT 0,
    skipped_rows    INTEGER DEFAULT 0,
    uploaded_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS validation_runs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT NOT NULL,
    started_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME,
    total_processed INTEGER DEFAULT 0,
    valid_count     INTEGER DEFAULT 0,
    invalid_count   INTEGER DEFAULT 0,
    risky_count     INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    inconclusive_count INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'running' CHECK (status IN ('running','completed','failed'))
);

CREATE TABLE IF NOT EXISTS validation_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id        INTEGER NOT NULL,
    run_id          INTEGER NOT NULL,
    stage           TEXT NOT NULL,
    result          TEXT NOT NULL,
    detail          TEXT,
    duration_ms     INTEGER,
    logged_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_id) REFERENCES email_repository(id),
    FOREIGN KEY (run_id) REFERENCES validation_runs(id)
);