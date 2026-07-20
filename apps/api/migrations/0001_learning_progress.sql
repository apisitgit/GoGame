CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    quest_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    world TEXT NOT NULL,
    concepts TEXT[] NOT NULL DEFAULT '{}',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id),
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    reward_exp INTEGER NOT NULL CHECK (reward_exp >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY,
    display_name TEXT NOT NULL DEFAULT 'Local Player',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_progress (
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL REFERENCES quests(id),
    status TEXT NOT NULL CHECK (status IN ('locked', 'available', 'active', 'completed')),
    earned_exp INTEGER NOT NULL DEFAULT 0 CHECK (earned_exp >= 0),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (player_id, quest_id)
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL REFERENCES quests(id),
    lesson_id TEXT NOT NULL REFERENCES lessons(id),
    source_size INTEGER NOT NULL CHECK (source_size >= 0),
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'compile_error', 'runtime_error', 'timeout', 'internal_error')),
    stdout_preview TEXT NOT NULL DEFAULT '',
    feedback TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO lessons (id, quest_id, title, world, concepts, content)
VALUES (
    'hello-world-001',
    'hello-gopher',
    'คำทักทายจาก Gopher',
    'beginner-village',
    ARRAY['package-main', 'import', 'func-main', 'fmt-println'],
    '{"summary":"Hello World lesson metadata. Full lesson content is stored in content/lessons/hello-world.json during MVP."}'::jsonb
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    world = EXCLUDED.world,
    concepts = EXCLUDED.concepts,
    content = EXCLUDED.content;

INSERT INTO quests (id, lesson_id, title, objective, reward_exp)
VALUES (
    'hello-gopher',
    'hello-world-001',
    'คำทักทายจาก Gopher',
    'แสดงข้อความ "สวัสดี Gopher" ด้วยโปรแกรม Go',
    100
)
ON CONFLICT (id) DO UPDATE
SET lesson_id = EXCLUDED.lesson_id,
    title = EXCLUDED.title,
    objective = EXCLUDED.objective,
    reward_exp = EXCLUDED.reward_exp;
