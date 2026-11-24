-- Tìm kiếm không phân biệt dấu (GET /v1/job/search)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Candidate Table
CREATE TABLE IF NOT EXISTS candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    cid VARCHAR(50) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employer Table
CREATE TABLE IF NOT EXISTS employers (
    emp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    website VARCHAR(255),
    tax_code VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    description TEXT,
    field VARCHAR(255),
    scope VARCHAR(255),
    representative_name VARCHAR(255) NOT NULL,
    cid VARCHAR(50) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Post (Job) Table
CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    location VARCHAR(255),
    role VARCHAR(255),
    education_level VARCHAR(50),
    experience INT DEFAULT 0,
    num_slot INT DEFAULT 1,
    job_type VARCHAR(20) NOT NULL
    CHECK (job_type IN ('remote', 'offline', 'hybrid')),
    working_shifts TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(emp_id) ON DELETE CASCADE
);

-- Application Table
CREATE TABLE IF NOT EXISTS applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    cv_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'screening','interview', 'rejected','withdrawn','recruited')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

-- Interview Table
CREATE TABLE IF NOT EXISTS interviews (
    interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    emp_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    time TIMESTAMPTZ,
    duration INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (emp_id) REFERENCES employers(emp_id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);

-- Message Table
CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedbacks (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    emp_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    rate INT CHECK (rate >= 1 AND rate <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (emp_id) REFERENCES employers(emp_id) ON DELETE CASCADE
);

---Transaction Table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INT NOT NULL,
    currency VARCHAR(20) NOT NULL DEFAULT 'VND',
    status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing','completed', 'failed')),
    provider_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
