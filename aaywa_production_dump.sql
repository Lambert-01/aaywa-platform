--
-- PostgreSQL database dump
--

\restrict 5DsRNlLqyACkSsgyVH1b1UgbWb4EwTXW0GpJrhszbFT4CmwSI3dhMSopdrgkGfr

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: calculate_cost_per_kg(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_cost_per_kg(batch_id_param integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_cost DECIMAL(12, 2);
    quantity DECIMAL(10, 2);
BEGIN
    SELECT 
        COALESCE(SUM(cfi.kg_amount * cfi.cost_per_kg), 0) + 
        COALESCE(SUM(cw.daily_wage), 0)
    INTO total_cost
    FROM compost_batches cb
    LEFT JOIN compost_feedstock_items cfi ON cfi.batch_id = cb.id
    LEFT JOIN compost_workdays cw ON cw.batch_id = cb.id
    WHERE cb.id = batch_id_param;
    
    SELECT quantity_kg INTO quantity
    FROM compost_batches
    WHERE id = batch_id_param;
    
    IF quantity > 0 THEN
        RETURN total_cost / quantity;
    ELSE
        RETURN 0;
    END IF;
END;
$$;


ALTER FUNCTION public.calculate_cost_per_kg(batch_id_param integer) OWNER TO postgres;

--
-- Name: FUNCTION calculate_cost_per_kg(batch_id_param integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.calculate_cost_per_kg(batch_id_param integer) IS 'Calculates the production cost per kg for a compost batch';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: aaywa_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO aaywa_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aggregation_centers; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.aggregation_centers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    location_lat numeric(10,8) NOT NULL,
    location_lng numeric(11,8) NOT NULL,
    buyer_partners text[],
    operating_hours character varying(100),
    contact_info text,
    status character varying(50) DEFAULT 'operational'::character varying,
    last_pickup_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT aggregation_centers_status_check CHECK (((status)::text = ANY ((ARRAY['operational'::character varying, 'offline'::character varying, 'maintenance'::character varying])::text[])))
);


ALTER TABLE public.aggregation_centers OWNER TO aaywa_user;

--
-- Name: aggregation_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.aggregation_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aggregation_centers_id_seq OWNER TO aaywa_user;

--
-- Name: aggregation_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.aggregation_centers_id_seq OWNED BY public.aggregation_centers.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    alert_type character varying(50) NOT NULL,
    severity character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    action_url character varying(200),
    entity_type character varying(50),
    entity_id integer,
    entity_name character varying(200),
    triggered_by character varying(100),
    threshold_value numeric(10,2),
    actual_value numeric(10,2),
    dismissed boolean DEFAULT false,
    dismissed_at timestamp without time zone,
    dismissed_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT alerts_severity_check CHECK (((severity)::text = ANY ((ARRAY['critical'::character varying, 'warning'::character varying, 'info'::character varying, 'success'::character varying])::text[])))
);


ALTER TABLE public.alerts OWNER TO aaywa_user;

--
-- Name: TABLE alerts; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.alerts IS 'Real-time intelligence alerts for platform monitoring';


--
-- Name: COLUMN alerts.severity; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON COLUMN public.alerts.severity IS 'critical=red, warning=yellow, info=blue, success=green';


--
-- Name: COLUMN alerts.action_url; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON COLUMN public.alerts.action_url IS 'Deep link to relevant page, e.g. /dashboard/cohorts/3';


--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO aaywa_user;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: catalog; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.catalog (
    id integer NOT NULL,
    product_name character varying(100) NOT NULL,
    product_type character varying(50),
    price_per_kg numeric(10,2) NOT NULL,
    available_kg numeric(10,2) DEFAULT 0.00,
    description text,
    image_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.catalog OWNER TO aaywa_user;

--
-- Name: catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.catalog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.catalog_id_seq OWNER TO aaywa_user;

--
-- Name: catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.catalog_id_seq OWNED BY public.catalog.id;


--
-- Name: champions; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.champions (
    id integer NOT NULL,
    farmer_id integer,
    cohort_id integer,
    certified_date date NOT NULL,
    peers_assigned integer DEFAULT 0,
    peers_trained integer DEFAULT 0,
    sessions_led integer DEFAULT 0,
    avg_attendance_rate numeric(5,2) DEFAULT 0.00,
    avg_feedback_score numeric(3,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT champions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.champions OWNER TO aaywa_user;

--
-- Name: champions_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.champions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.champions_id_seq OWNER TO aaywa_user;

--
-- Name: champions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.champions_id_seq OWNED BY public.champions.id;


--
-- Name: cohort_geo_summary; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.cohort_geo_summary AS
SELECT
    NULL::integer AS id,
    NULL::character varying(100) AS name,
    NULL::character varying(50) AS cropping_system,
    NULL::jsonb AS boundary_coordinates,
    NULL::character varying(20) AS boundary_color,
    NULL::bigint AS farmer_count,
    NULL::numeric AS total_area_hectares;


ALTER VIEW public.cohort_geo_summary OWNER TO aaywa_user;

--
-- Name: cohorts; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.cohorts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    cropping_system character varying(50) NOT NULL,
    boundary_coordinates jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    boundary_color character varying(20) DEFAULT '#4CAF50'::character varying,
    CONSTRAINT cohorts_cropping_system_check CHECK (((cropping_system)::text = ANY ((ARRAY['avocado'::character varying, 'macadamia'::character varying])::text[]))),
    CONSTRAINT cohorts_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.cohorts OWNER TO aaywa_user;

--
-- Name: TABLE cohorts; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.cohorts IS 'Coffee planting cohorts grouped by cropping system';


--
-- Name: cohorts_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.cohorts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cohorts_id_seq OWNER TO aaywa_user;

--
-- Name: cohorts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.cohorts_id_seq OWNED BY public.cohorts.id;


--
-- Name: compost_batches; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.compost_batches (
    id integer NOT NULL,
    batch_number character varying(50) NOT NULL,
    quality_score numeric(5,2),
    kg_produced numeric(10,2),
    temperature_max numeric(5,2),
    start_date date NOT NULL,
    maturity_date date,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    location character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    feedstock_composition jsonb,
    temperature_log jsonb DEFAULT '[]'::jsonb,
    moisture_readings jsonb DEFAULT '[]'::jsonb,
    cohort_id integer,
    produced_by integer,
    production_date date DEFAULT CURRENT_DATE,
    quantity_kg numeric(10,2) DEFAULT 0,
    CONSTRAINT compost_batches_quality_score_check CHECK (((quality_score >= (0)::numeric) AND (quality_score <= (100)::numeric)))
);


ALTER TABLE public.compost_batches OWNER TO aaywa_user;

--
-- Name: TABLE compost_batches; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.compost_batches IS 'Compost production tracking with quality scores';


--
-- Name: compost_feedstock_items; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.compost_feedstock_items (
    id integer NOT NULL,
    batch_id integer NOT NULL,
    material_type character varying(100) NOT NULL,
    percentage numeric(5,2) NOT NULL,
    kg_amount numeric(10,2) NOT NULL,
    cost_per_kg numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT compost_feedstock_items_kg_amount_check CHECK ((kg_amount >= (0)::numeric)),
    CONSTRAINT compost_feedstock_items_percentage_check CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric))),
    CONSTRAINT valid_percentage CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric)))
);


ALTER TABLE public.compost_feedstock_items OWNER TO aaywa_user;

--
-- Name: TABLE compost_feedstock_items; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.compost_feedstock_items IS 'Stores the composition of organic materials used in each compost batch';


--
-- Name: compost_sales; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.compost_sales (
    id integer NOT NULL,
    batch_id integer NOT NULL,
    buyer_name character varying(200) NOT NULL,
    buyer_contact character varying(50),
    kg_sold numeric(10,2) NOT NULL,
    price_per_kg numeric(10,2) NOT NULL,
    total_revenue numeric(12,2) GENERATED ALWAYS AS ((kg_sold * price_per_kg)) STORED,
    sale_date date NOT NULL,
    payment_method character varying(50) DEFAULT 'Mobile Money'::character varying,
    payment_reference character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    CONSTRAINT compost_sales_kg_sold_check CHECK ((kg_sold > (0)::numeric)),
    CONSTRAINT compost_sales_price_per_kg_check CHECK ((price_per_kg > (0)::numeric))
);


ALTER TABLE public.compost_sales OWNER TO aaywa_user;

--
-- Name: TABLE compost_sales; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.compost_sales IS 'Tracks surplus compost sales to external buyers';


--
-- Name: compost_workdays; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.compost_workdays (
    id integer NOT NULL,
    farmer_id integer,
    batch_id integer,
    hours_worked numeric(4,2) DEFAULT 8.00,
    stipend_amount numeric(10,2) DEFAULT 3000.00,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_date date,
    created_at timestamp without time zone DEFAULT now(),
    worker_id integer,
    date_worked date DEFAULT CURRENT_DATE,
    daily_wage numeric(10,2) DEFAULT 0,
    CONSTRAINT compost_workdays_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.compost_workdays OWNER TO aaywa_user;

--
-- Name: TABLE compost_workdays; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.compost_workdays IS 'Daily stipend tracking for compost workers (RWF 3,000/day)';


--
-- Name: users; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone,
    registration_status character varying(20) DEFAULT 'approved'::character varying,
    registration_notes text,
    requested_role character varying(50),
    registration_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_by integer,
    approved_at timestamp without time zone,
    CONSTRAINT users_registration_status_check CHECK (((registration_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO aaywa_user;

--
-- Name: compost_batch_summary; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.compost_batch_summary AS
 SELECT cb.id,
    cb.batch_number,
    cb.production_date,
    cb.start_date,
    cb.maturity_date,
    cb.quantity_kg,
    cb.quality_score,
    cb.status,
    cb.cohort_id,
    c.name AS cohort_name,
    u.full_name AS producer_name,
    COALESCE(( SELECT json_agg(json_build_object('type', cfi.material_type, 'percentage', cfi.percentage, 'kgAmount', cfi.kg_amount, 'cost', cfi.cost_per_kg)) AS json_agg
           FROM public.compost_feedstock_items cfi
          WHERE (cfi.batch_id = cb.id)), '[]'::json) AS feedstock_mix,
    COALESCE(( SELECT sum(cw.daily_wage) AS sum
           FROM public.compost_workdays cw
          WHERE (cw.batch_id = cb.id)), (0)::numeric) AS total_labor_cost,
    COALESCE(( SELECT sum((cfi.kg_amount * cfi.cost_per_kg)) AS sum
           FROM public.compost_feedstock_items cfi
          WHERE (cfi.batch_id = cb.id)), (0)::numeric) AS total_feedstock_cost,
    COALESCE(( SELECT sum(cs.kg_sold) AS sum
           FROM public.compost_sales cs
          WHERE (cs.batch_id = cb.id)), (0)::numeric) AS kg_sold,
    COALESCE(( SELECT sum(cs.total_revenue) AS sum
           FROM public.compost_sales cs
          WHERE (cs.batch_id = cb.id)), (0)::numeric) AS total_revenue
   FROM ((public.compost_batches cb
     LEFT JOIN public.users u ON ((cb.produced_by = u.id)))
     LEFT JOIN public.cohorts c ON ((cb.cohort_id = c.id)))
  ORDER BY cb.created_at DESC;


ALTER VIEW public.compost_batch_summary OWNER TO aaywa_user;

--
-- Name: compost_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.compost_batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compost_batches_id_seq OWNER TO aaywa_user;

--
-- Name: compost_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.compost_batches_id_seq OWNED BY public.compost_batches.id;


--
-- Name: compost_feedstock_items_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.compost_feedstock_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compost_feedstock_items_id_seq OWNER TO aaywa_user;

--
-- Name: compost_feedstock_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.compost_feedstock_items_id_seq OWNED BY public.compost_feedstock_items.id;


--
-- Name: compost_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.compost_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compost_sales_id_seq OWNER TO aaywa_user;

--
-- Name: compost_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.compost_sales_id_seq OWNED BY public.compost_sales.id;


--
-- Name: compost_workdays_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.compost_workdays_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compost_workdays_id_seq OWNER TO aaywa_user;

--
-- Name: compost_workdays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.compost_workdays_id_seq OWNED BY public.compost_workdays.id;


--
-- Name: facility_summary; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.facility_summary AS
SELECT
    NULL::integer AS id,
    NULL::character varying(255) AS name,
    NULL::character varying(50) AS type,
    NULL::character varying(255) AS location_name,
    NULL::numeric(10,2) AS capacity_kg,
    NULL::numeric(10,2) AS current_usage_kg,
    NULL::numeric(5,2) AS temperature_celsius,
    NULL::numeric(5,2) AS humidity_percent,
    NULL::character varying(50) AS status,
    NULL::numeric AS usage_percentage,
    NULL::bigint AS transaction_count;


ALTER VIEW public.facility_summary OWNER TO aaywa_user;

--
-- Name: farmers; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.farmers (
    id integer NOT NULL,
    cohort_id integer,
    vsla_id integer,
    full_name character varying(100) NOT NULL,
    phone character varying(20),
    date_of_birth date,
    gender character varying(10),
    household_type character varying(50),
    location_coordinates jsonb,
    plot_size_hectares numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    plot_boundary_coordinates jsonb,
    plot_area_hectares numeric(8,4),
    crops text,
    co_crops text,
    photo_url text,
    CONSTRAINT farmers_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT farmers_household_type_check CHECK (((household_type)::text = ANY ((ARRAY['teen_mother'::character varying, 'female_headed'::character varying, 'land_poor'::character varying, 'champion'::character varying, 'standard'::character varying])::text[])))
);


ALTER TABLE public.farmers OWNER TO aaywa_user;

--
-- Name: TABLE farmers; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.farmers IS 'Individual farmer profiles with household classification';


--
-- Name: sales; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    farmer_id integer,
    crop_type character varying(50) NOT NULL,
    quantity_kg numeric(10,2) NOT NULL,
    gross_revenue numeric(10,2) NOT NULL,
    input_cost numeric(10,2) DEFAULT 0.00,
    net_revenue numeric(10,2) NOT NULL,
    farmer_share numeric(10,2) NOT NULL,
    sanza_share numeric(10,2) NOT NULL,
    sale_date timestamp without time zone DEFAULT now(),
    buyer_name character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO aaywa_user;

--
-- Name: TABLE sales; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.sales IS 'Crop sales with 70-30 profit sharing (farmer-sanza)';


--
-- Name: vsla_groups; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.vsla_groups (
    id integer NOT NULL,
    cohort_id integer,
    name character varying(100) NOT NULL,
    seed_capital numeric(10,2) DEFAULT 12000.00,
    total_savings numeric(10,2) DEFAULT 0.00,
    member_count integer DEFAULT 0,
    meeting_day character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    maintenance_fund numeric(10,2) DEFAULT 0
);


ALTER TABLE public.vsla_groups OWNER TO aaywa_user;

--
-- Name: TABLE vsla_groups; Type: COMMENT; Schema: public; Owner: aaywa_user
--

COMMENT ON TABLE public.vsla_groups IS 'Village Savings and Loan Associations with €10/member seed capital';


--
-- Name: vsla_members; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.vsla_members (
    id integer NOT NULL,
    vsla_id integer,
    farmer_id integer,
    role character varying(50),
    opening_savings numeric(10,2) DEFAULT 12000,
    current_balance numeric(10,2) DEFAULT 12000,
    joined_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    CONSTRAINT vsla_members_role_check CHECK (((role)::text = ANY ((ARRAY['chair'::character varying, 'treasurer'::character varying, 'secretary'::character varying, 'loan_officer'::character varying, 'auditor'::character varying, 'member'::character varying])::text[])))
);


ALTER TABLE public.vsla_members OWNER TO aaywa_user;

--
-- Name: farmer_plots_geo; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.farmer_plots_geo AS
 SELECT f.id,
    f.full_name AS name,
    f.household_type,
    f.plot_boundary_coordinates,
    f.plot_area_hectares,
    c.id AS cohort_id,
    c.name AS cohort_name,
    c.cropping_system,
    c.boundary_color AS cohort_color,
    COALESCE(( SELECT sum(sales.gross_revenue) AS sum
           FROM public.sales
          WHERE (sales.farmer_id = f.id)), (0)::numeric) AS total_sales,
    COALESCE(( SELECT vsla_groups.seed_capital
           FROM public.vsla_groups
          WHERE (vsla_groups.id = ( SELECT vsla_members.vsla_id
                   FROM public.vsla_members
                  WHERE (vsla_members.farmer_id = f.id)
                 LIMIT 1))), (0)::numeric) AS vsla_balance
   FROM (public.farmers f
     LEFT JOIN public.cohorts c ON ((f.cohort_id = c.id)))
  WHERE (f.plot_boundary_coordinates IS NOT NULL);


ALTER VIEW public.farmer_plots_geo OWNER TO aaywa_user;

--
-- Name: farmers_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.farmers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.farmers_id_seq OWNER TO aaywa_user;

--
-- Name: farmers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.farmers_id_seq OWNED BY public.farmers.id;


--
-- Name: input_invoices; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.input_invoices (
    id integer NOT NULL,
    farmer_id integer,
    input_type character varying(50) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_cost numeric(10,2) NOT NULL,
    invoice_date date DEFAULT CURRENT_DATE,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT input_invoices_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'deferred'::character varying])::text[])))
);


ALTER TABLE public.input_invoices OWNER TO aaywa_user;

--
-- Name: input_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.input_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.input_invoices_id_seq OWNER TO aaywa_user;

--
-- Name: input_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.input_invoices_id_seq OWNED BY public.input_invoices.id;


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.inventory_transactions (
    id integer NOT NULL,
    facility_id integer,
    crop_type character varying(100) NOT NULL,
    quantity_kg numeric(10,2) NOT NULL,
    direction character varying(20) NOT NULL,
    reason character varying(100) NOT NULL,
    quality_grade character varying(10),
    temperature_at_transaction numeric(5,2),
    related_farmer_id integer,
    related_order_id integer,
    notes text,
    status character varying(50) DEFAULT 'completed'::character varying,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_transactions_direction_check CHECK (((direction)::text = ANY ((ARRAY['incoming'::character varying, 'outgoing'::character varying])::text[]))),
    CONSTRAINT inventory_transactions_reason_check CHECK (((reason)::text = ANY ((ARRAY['harvest'::character varying, 'sale'::character varying, 'donation'::character varying, 'damage'::character varying, 'spoilage'::character varying, 'transfer'::character varying])::text[])))
);


ALTER TABLE public.inventory_transactions OWNER TO aaywa_user;

--
-- Name: inventory_balance; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.inventory_balance AS
 SELECT facility_id,
    crop_type,
    sum(
        CASE
            WHEN ((direction)::text = 'incoming'::text) THEN quantity_kg
            ELSE (0)::numeric
        END) AS total_incoming_kg,
    sum(
        CASE
            WHEN ((direction)::text = 'outgoing'::text) THEN quantity_kg
            ELSE (0)::numeric
        END) AS total_outgoing_kg,
    sum(
        CASE
            WHEN ((direction)::text = 'incoming'::text) THEN quantity_kg
            ELSE (- quantity_kg)
        END) AS current_stock_kg
   FROM public.inventory_transactions
  GROUP BY facility_id, crop_type
 HAVING (sum(
        CASE
            WHEN ((direction)::text = 'incoming'::text) THEN quantity_kg
            ELSE (- quantity_kg)
        END) > (0)::numeric);


ALTER VIEW public.inventory_balance OWNER TO aaywa_user;

--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.inventory_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_transactions_id_seq OWNER TO aaywa_user;

--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.inventory_transactions_id_seq OWNED BY public.inventory_transactions.id;


--
-- Name: learning_materials; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.learning_materials (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    category character varying(50) NOT NULL,
    file_type character varying(10) NOT NULL,
    file_url character varying(255) NOT NULL,
    version character varying(20) DEFAULT '1.0'::character varying,
    description text,
    download_count integer DEFAULT 0,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT learning_materials_category_check CHECK (((category)::text = ANY ((ARRAY['Agronomy'::character varying, 'VSLA'::character varying, 'Nutrition'::character varying, 'Compost'::character varying, 'Business Skills'::character varying])::text[]))),
    CONSTRAINT learning_materials_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['PDF'::character varying, 'Video'::character varying, 'Audio'::character varying, 'Image'::character varying])::text[])))
);


ALTER TABLE public.learning_materials OWNER TO aaywa_user;

--
-- Name: learning_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.learning_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_materials_id_seq OWNER TO aaywa_user;

--
-- Name: learning_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.learning_materials_id_seq OWNED BY public.learning_materials.id;


--
-- Name: post_harvest_losses; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.post_harvest_losses (
    id integer NOT NULL,
    transaction_id integer,
    loss_category character varying(100),
    loss_quantity_kg numeric(10,2),
    loss_value numeric(10,2),
    root_cause text,
    prevention_strategy text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT post_harvest_losses_loss_category_check CHECK (((loss_category)::text = ANY ((ARRAY['physical_damage'::character varying, 'spoilage'::character varying, 'weight_loss'::character varying, 'theft'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.post_harvest_losses OWNER TO aaywa_user;

--
-- Name: loss_analysis; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.loss_analysis AS
 SELECT date_trunc('month'::text, created_at) AS loss_month,
    loss_category,
    count(*) AS incident_count,
    sum(loss_quantity_kg) AS total_loss_kg,
    sum(loss_value) AS total_loss_value
   FROM public.post_harvest_losses phl
  GROUP BY (date_trunc('month'::text, created_at)), loss_category
  ORDER BY (date_trunc('month'::text, created_at)) DESC;


ALTER VIEW public.loss_analysis OWNER TO aaywa_user;

--
-- Name: maintenance_records; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.maintenance_records (
    id integer NOT NULL,
    facility_id integer,
    issue_description text NOT NULL,
    maintenance_type character varying(50),
    cost numeric(10,2),
    vendor_name character varying(255),
    status character varying(50) DEFAULT 'scheduled'::character varying,
    scheduled_date timestamp without time zone,
    completed_date timestamp without time zone,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT maintenance_records_maintenance_type_check CHECK (((maintenance_type)::text = ANY ((ARRAY['preventive'::character varying, 'reactive'::character varying, 'emergency'::character varying])::text[]))),
    CONSTRAINT maintenance_records_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.maintenance_records OWNER TO aaywa_user;

--
-- Name: maintenance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.maintenance_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_records_id_seq OWNER TO aaywa_user;

--
-- Name: maintenance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.maintenance_records_id_seq OWNED BY public.maintenance_records.id;


--
-- Name: map_measurements; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.map_measurements (
    id integer NOT NULL,
    user_id integer,
    measurement_type character varying(20),
    coordinates jsonb NOT NULL,
    calculated_value numeric(12,4),
    unit character varying(20),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT map_measurements_measurement_type_check CHECK (((measurement_type)::text = ANY ((ARRAY['distance'::character varying, 'area'::character varying])::text[])))
);


ALTER TABLE public.map_measurements OWNER TO aaywa_user;

--
-- Name: map_measurements_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.map_measurements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.map_measurements_id_seq OWNER TO aaywa_user;

--
-- Name: map_measurements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.map_measurements_id_seq OWNED BY public.map_measurements.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    farmer_share numeric(10,2) NOT NULL,
    sanza_share numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO aaywa_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO aaywa_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    customer_name character varying(100) NOT NULL,
    customer_phone character varying(20) NOT NULL,
    customer_email character varying(100),
    customer_type character varying(50),
    delivery_address text NOT NULL,
    delivery_date date NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    order_status character varying(20) DEFAULT 'pending'::character varying,
    tracking_number character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO aaywa_user;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO aaywa_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: quiz_results; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.quiz_results (
    id integer NOT NULL,
    quiz_id integer,
    farmer_id integer,
    score numeric(5,2) NOT NULL,
    passed boolean NOT NULL,
    answers jsonb NOT NULL,
    submission_method character varying(20) DEFAULT 'mobile_app'::character varying,
    submitted_at timestamp without time zone DEFAULT now(),
    CONSTRAINT quiz_results_submission_method_check CHECK (((submission_method)::text = ANY ((ARRAY['mobile_app'::character varying, 'ussd'::character varying, 'manual'::character varying])::text[])))
);


ALTER TABLE public.quiz_results OWNER TO aaywa_user;

--
-- Name: training_attendance; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.training_attendance (
    id integer NOT NULL,
    session_id integer,
    farmer_id integer,
    attendance_status character varying(20) DEFAULT 'present'::character varying,
    check_in_method character varying(20) DEFAULT 'manual'::character varying,
    check_in_time timestamp without time zone,
    childcare_used boolean DEFAULT false,
    feedback_score integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT training_attendance_attendance_status_check CHECK (((attendance_status)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying])::text[]))),
    CONSTRAINT training_attendance_check_in_method_check CHECK (((check_in_method)::text = ANY ((ARRAY['mobile_app'::character varying, 'ussd'::character varying, 'manual'::character varying])::text[]))),
    CONSTRAINT training_attendance_feedback_score_check CHECK (((feedback_score >= 1) AND (feedback_score <= 5)))
);


ALTER TABLE public.training_attendance OWNER TO aaywa_user;

--
-- Name: participant_training_stats; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.participant_training_stats AS
 SELECT f.id AS farmer_id,
    f.full_name AS farmer_name,
    f.cohort_id,
    f.phone,
    count(DISTINCT
        CASE
            WHEN ((ta.attendance_status)::text = 'present'::text) THEN ta.session_id
            ELSE NULL::integer
        END) AS sessions_attended,
    count(DISTINCT ta.session_id) AS total_sessions_scheduled,
    round(avg(
        CASE
            WHEN ((ta.attendance_status)::text = 'present'::text) THEN 100.0
            ELSE 0.0
        END), 2) AS attendance_rate,
    count(DISTINCT qr.id) AS quizzes_taken,
    round(avg(qr.score), 2) AS avg_quiz_score,
    count(DISTINCT
        CASE
            WHEN (qr.passed = true) THEN qr.id
            ELSE NULL::integer
        END) AS quizzes_passed,
    max(ta.created_at) AS last_activity,
        CASE
            WHEN (ch.id IS NOT NULL) THEN 'Champion'::text
            ELSE 'Farmer'::text
        END AS role
   FROM (((public.farmers f
     LEFT JOIN public.training_attendance ta ON ((f.id = ta.farmer_id)))
     LEFT JOIN public.quiz_results qr ON ((f.id = qr.farmer_id)))
     LEFT JOIN public.champions ch ON ((f.id = ch.farmer_id)))
  GROUP BY f.id, f.full_name, f.cohort_id, f.phone, ch.id;


ALTER VIEW public.participant_training_stats OWNER TO aaywa_user;

--
-- Name: post_harvest_losses_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.post_harvest_losses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_harvest_losses_id_seq OWNER TO aaywa_user;

--
-- Name: post_harvest_losses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.post_harvest_losses_id_seq OWNED BY public.post_harvest_losses.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_type character varying(50) NOT NULL,
    box_size numeric(5,2) NOT NULL,
    cohort_id integer,
    harvest_date date NOT NULL,
    available_quantity integer NOT NULL,
    price_per_kg numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    description text,
    certifications jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url character varying(255)
);


ALTER TABLE public.products OWNER TO aaywa_user;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO aaywa_user;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.quiz_questions (
    id integer NOT NULL,
    quiz_id integer,
    question_text text NOT NULL,
    options jsonb NOT NULL,
    correct_answer character varying(10) NOT NULL,
    points integer DEFAULT 1,
    explanation text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quiz_questions OWNER TO aaywa_user;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.quiz_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_id_seq OWNER TO aaywa_user;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- Name: quiz_results_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.quiz_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_results_id_seq OWNER TO aaywa_user;

--
-- Name: quiz_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.quiz_results_id_seq OWNED BY public.quiz_results.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    session_id integer,
    title character varying(200) NOT NULL,
    category character varying(50) NOT NULL,
    passing_score numeric(5,2) DEFAULT 70.00,
    total_points integer DEFAULT 10,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quizzes OWNER TO aaywa_user;

--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_id_seq OWNER TO aaywa_user;

--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO aaywa_user;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: storage_facilities; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.storage_facilities (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    location_name character varying(255),
    location_lat numeric(10,8),
    location_lng numeric(11,8),
    capacity_kg numeric(10,2) NOT NULL,
    current_usage_kg numeric(10,2) DEFAULT 0,
    temperature_celsius numeric(5,2),
    humidity_percent numeric(5,2),
    status character varying(50) DEFAULT 'operational'::character varying,
    maintenance_due_date timestamp without time zone,
    last_maintenance_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    temperature_min numeric(5,2),
    temperature_max numeric(5,2),
    CONSTRAINT storage_facilities_status_check CHECK (((status)::text = ANY ((ARRAY['operational'::character varying, 'maintenance_due'::character varying, 'at_risk'::character varying, 'offline'::character varying])::text[]))),
    CONSTRAINT storage_facilities_type_check CHECK (((type)::text = ANY ((ARRAY['cold_room'::character varying, 'insulated_shed'::character varying, 'ambient_storage'::character varying])::text[])))
);


ALTER TABLE public.storage_facilities OWNER TO aaywa_user;

--
-- Name: storage_facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.storage_facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.storage_facilities_id_seq OWNER TO aaywa_user;

--
-- Name: storage_facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.storage_facilities_id_seq OWNED BY public.storage_facilities.id;


--
-- Name: temperature_logs; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.temperature_logs (
    id integer NOT NULL,
    facility_id integer,
    temperature_celsius numeric(5,2) NOT NULL,
    humidity_percent numeric(5,2),
    alert_triggered boolean DEFAULT false,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.temperature_logs OWNER TO aaywa_user;

--
-- Name: temperature_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.temperature_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.temperature_logs_id_seq OWNER TO aaywa_user;

--
-- Name: temperature_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.temperature_logs_id_seq OWNED BY public.temperature_logs.id;


--
-- Name: training_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.training_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_attendance_id_seq OWNER TO aaywa_user;

--
-- Name: training_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.training_attendance_id_seq OWNED BY public.training_attendance.id;


--
-- Name: training_session_summary; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.training_session_summary AS
SELECT
    NULL::integer AS id,
    NULL::character varying(200) AS title,
    NULL::integer AS cohort_id,
    NULL::character varying(100) AS cohort_name,
    NULL::integer AS trainer_id,
    NULL::character varying(100) AS trainer_name,
    NULL::character varying(50) AS session_type,
    NULL::timestamp without time zone AS date,
    NULL::numeric(3,1) AS duration_hours,
    NULL::character varying(200) AS location,
    NULL::boolean AS childcare_provided,
    NULL::jsonb AS materials,
    NULL::integer AS expected_attendees,
    NULL::integer AS actual_attendees,
    NULL::numeric AS attendance_rate,
    NULL::character varying(20) AS status,
    NULL::text AS notes,
    NULL::timestamp without time zone AS created_at,
    NULL::timestamp without time zone AS updated_at,
    NULL::bigint AS attendance_records,
    NULL::numeric AS avg_feedback;


ALTER VIEW public.training_session_summary OWNER TO aaywa_user;

--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.training_sessions (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    cohort_id integer,
    trainer_id integer,
    session_type character varying(50) NOT NULL,
    date timestamp without time zone NOT NULL,
    duration_hours numeric(3,1) DEFAULT 2.0 NOT NULL,
    location character varying(200) NOT NULL,
    childcare_provided boolean DEFAULT false,
    materials jsonb DEFAULT '[]'::jsonb,
    expected_attendees integer DEFAULT 0,
    actual_attendees integer DEFAULT 0,
    status character varying(20) DEFAULT 'Scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT training_sessions_session_type_check CHECK (((session_type)::text = ANY ((ARRAY['Master Training'::character varying, 'Champion Training'::character varying, 'VSLA'::character varying, 'Nutrition'::character varying, 'Agronomy'::character varying])::text[]))),
    CONSTRAINT training_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['Scheduled'::character varying, 'Completed'::character varying, 'Cancelled'::character varying])::text[])))
);


ALTER TABLE public.training_sessions OWNER TO aaywa_user;

--
-- Name: training_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.training_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_sessions_id_seq OWNER TO aaywa_user;

--
-- Name: training_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.training_sessions_id_seq OWNED BY public.training_sessions.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO aaywa_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vsla_constitutions; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.vsla_constitutions (
    id integer NOT NULL,
    vsla_id integer,
    content text NOT NULL,
    version character varying(20) DEFAULT '1.0'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vsla_constitutions OWNER TO aaywa_user;

--
-- Name: vsla_constitutions_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.vsla_constitutions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vsla_constitutions_id_seq OWNER TO aaywa_user;

--
-- Name: vsla_constitutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.vsla_constitutions_id_seq OWNED BY public.vsla_constitutions.id;


--
-- Name: vsla_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.vsla_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vsla_groups_id_seq OWNER TO aaywa_user;

--
-- Name: vsla_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.vsla_groups_id_seq OWNED BY public.vsla_groups.id;


--
-- Name: vsla_transactions; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.vsla_transactions (
    id integer NOT NULL,
    vsla_id integer,
    member_id integer,
    type character varying(50),
    amount numeric(10,2) NOT NULL,
    balance_after numeric(10,2),
    description text,
    status character varying(20) DEFAULT 'completed'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    repayment_date date,
    interest_rate numeric(5,2),
    work_type character varying(50),
    days_worked integer,
    vendor_name character varying(100),
    receipt_url character varying(255),
    sale_reference character varying(50),
    linked_loan_id integer,
    CONSTRAINT vsla_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['savings'::character varying, 'loan_disbursement'::character varying, 'loan_repayment'::character varying, 'stipend'::character varying, 'maintenance_expense'::character varying, 'input_repayment'::character varying])::text[])))
);


ALTER TABLE public.vsla_transactions OWNER TO aaywa_user;

--
-- Name: vsla_member_financial_summary; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.vsla_member_financial_summary AS
 SELECT vm.vsla_id,
    vm.id AS member_id,
    f.full_name,
    f.phone,
    vm.role,
    vm.current_balance,
    COALESCE(loan_summary.outstanding, (0)::numeric) AS active_loans_amount,
    COALESCE(loan_summary.loan_count, (0)::bigint) AS active_loans_count
   FROM ((public.vsla_members vm
     JOIN public.farmers f ON ((vm.farmer_id = f.id)))
     LEFT JOIN ( SELECT vsla_transactions.member_id,
            sum(vsla_transactions.amount) AS outstanding,
            count(*) AS loan_count
           FROM public.vsla_transactions
          WHERE ((vsla_transactions.type)::text = 'loan_disbursement'::text)
          GROUP BY vsla_transactions.member_id) loan_summary ON ((vm.id = loan_summary.member_id)));


ALTER VIEW public.vsla_member_financial_summary OWNER TO aaywa_user;

--
-- Name: vsla_members_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.vsla_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vsla_members_id_seq OWNER TO aaywa_user;

--
-- Name: vsla_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.vsla_members_id_seq OWNED BY public.vsla_members.id;


--
-- Name: vsla_officer_history; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.vsla_officer_history (
    id integer NOT NULL,
    vsla_id integer,
    member_id integer,
    role character varying(50),
    start_date date,
    end_date date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vsla_officer_history OWNER TO aaywa_user;

--
-- Name: vsla_officer_history_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.vsla_officer_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vsla_officer_history_id_seq OWNER TO aaywa_user;

--
-- Name: vsla_officer_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.vsla_officer_history_id_seq OWNED BY public.vsla_officer_history.id;


--
-- Name: vsla_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.vsla_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vsla_transactions_id_seq OWNER TO aaywa_user;

--
-- Name: vsla_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.vsla_transactions_id_seq OWNED BY public.vsla_transactions.id;


--
-- Name: warehouse_geo; Type: VIEW; Schema: public; Owner: aaywa_user
--

CREATE VIEW public.warehouse_geo AS
 SELECT id,
    name,
    type,
    location_lat,
    location_lng,
    location_name,
    capacity_kg,
    current_usage_kg,
    temperature_celsius,
    status,
        CASE
            WHEN (capacity_kg > (0)::numeric) THEN round(((current_usage_kg / capacity_kg) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS usage_percentage
   FROM public.storage_facilities sf
  WHERE ((location_lat IS NOT NULL) AND (location_lng IS NOT NULL));


ALTER VIEW public.warehouse_geo OWNER TO aaywa_user;

--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: aaywa_user
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    location character varying(200),
    capacity_kg numeric(10,2),
    current_stock_kg numeric(10,2) DEFAULT 0.00,
    manager_id integer,
    coordinates jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.warehouses OWNER TO aaywa_user;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: aaywa_user
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO aaywa_user;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aaywa_user
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: aggregation_centers id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.aggregation_centers ALTER COLUMN id SET DEFAULT nextval('public.aggregation_centers_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: catalog id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.catalog ALTER COLUMN id SET DEFAULT nextval('public.catalog_id_seq'::regclass);


--
-- Name: champions id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.champions ALTER COLUMN id SET DEFAULT nextval('public.champions_id_seq'::regclass);


--
-- Name: cohorts id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.cohorts ALTER COLUMN id SET DEFAULT nextval('public.cohorts_id_seq'::regclass);


--
-- Name: compost_batches id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_batches ALTER COLUMN id SET DEFAULT nextval('public.compost_batches_id_seq'::regclass);


--
-- Name: compost_feedstock_items id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_feedstock_items ALTER COLUMN id SET DEFAULT nextval('public.compost_feedstock_items_id_seq'::regclass);


--
-- Name: compost_sales id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_sales ALTER COLUMN id SET DEFAULT nextval('public.compost_sales_id_seq'::regclass);


--
-- Name: compost_workdays id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_workdays ALTER COLUMN id SET DEFAULT nextval('public.compost_workdays_id_seq'::regclass);


--
-- Name: farmers id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.farmers ALTER COLUMN id SET DEFAULT nextval('public.farmers_id_seq'::regclass);


--
-- Name: input_invoices id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.input_invoices ALTER COLUMN id SET DEFAULT nextval('public.input_invoices_id_seq'::regclass);


--
-- Name: inventory_transactions id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.inventory_transactions ALTER COLUMN id SET DEFAULT nextval('public.inventory_transactions_id_seq'::regclass);


--
-- Name: learning_materials id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.learning_materials ALTER COLUMN id SET DEFAULT nextval('public.learning_materials_id_seq'::regclass);


--
-- Name: maintenance_records id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.maintenance_records ALTER COLUMN id SET DEFAULT nextval('public.maintenance_records_id_seq'::regclass);


--
-- Name: map_measurements id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.map_measurements ALTER COLUMN id SET DEFAULT nextval('public.map_measurements_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: post_harvest_losses id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.post_harvest_losses ALTER COLUMN id SET DEFAULT nextval('public.post_harvest_losses_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- Name: quiz_results id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_results ALTER COLUMN id SET DEFAULT nextval('public.quiz_results_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: storage_facilities id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.storage_facilities ALTER COLUMN id SET DEFAULT nextval('public.storage_facilities_id_seq'::regclass);


--
-- Name: temperature_logs id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.temperature_logs ALTER COLUMN id SET DEFAULT nextval('public.temperature_logs_id_seq'::regclass);


--
-- Name: training_attendance id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_attendance ALTER COLUMN id SET DEFAULT nextval('public.training_attendance_id_seq'::regclass);


--
-- Name: training_sessions id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_sessions ALTER COLUMN id SET DEFAULT nextval('public.training_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vsla_constitutions id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_constitutions ALTER COLUMN id SET DEFAULT nextval('public.vsla_constitutions_id_seq'::regclass);


--
-- Name: vsla_groups id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_groups ALTER COLUMN id SET DEFAULT nextval('public.vsla_groups_id_seq'::regclass);


--
-- Name: vsla_members id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_members ALTER COLUMN id SET DEFAULT nextval('public.vsla_members_id_seq'::regclass);


--
-- Name: vsla_officer_history id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_officer_history ALTER COLUMN id SET DEFAULT nextval('public.vsla_officer_history_id_seq'::regclass);


--
-- Name: vsla_transactions id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_transactions ALTER COLUMN id SET DEFAULT nextval('public.vsla_transactions_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: aggregation_centers; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.aggregation_centers (id, name, location_lat, location_lng, buyer_partners, operating_hours, contact_info, status, last_pickup_date, created_at, updated_at) FROM stdin;
1	Huye Aggregation Center	-2.59457510	29.73855840	{"Afro Source Ltd","Kigali Fresh Markets","Rwanda Export Co"}	Monday-Friday 8:00-17:00, Saturday 8:00-12:00	+250 788 123 456 | huye@aaywa.org	operational	\N	2026-02-04 18:00:44.684308	2026-02-04 18:00:44.684308
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.alerts (id, alert_type, severity, title, message, action_url, entity_type, entity_id, entity_name, triggered_by, threshold_value, actual_value, dismissed, dismissed_at, dismissed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: catalog; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.catalog (id, product_name, product_type, price_per_kg, available_kg, description, image_url, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: champions; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.champions (id, farmer_id, cohort_id, certified_date, peers_assigned, peers_trained, sessions_led, avg_attendance_rate, avg_feedback_score, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cohorts; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.cohorts (id, name, cropping_system, boundary_coordinates, status, created_at, updated_at, boundary_color) FROM stdin;
1	Cohort 1 - Avocado North	avocado	\N	active	2026-01-31 15:28:07.469444	2026-01-31 15:28:07.469444	#4CAF50
2	Cohort 2 - Avocado South	avocado	\N	active	2026-01-31 15:28:07.481178	2026-01-31 15:28:07.481178	#4CAF50
3	Cohort 3 - Macadamia East	macadamia	\N	active	2026-01-31 15:28:07.482848	2026-01-31 15:28:07.482848	#4CAF50
4	Cohort 4 - Macadamia West	macadamia	\N	active	2026-01-31 15:28:07.484576	2026-01-31 15:28:07.484576	#4CAF50
\.


--
-- Data for Name: compost_batches; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.compost_batches (id, batch_number, quality_score, kg_produced, temperature_max, start_date, maturity_date, status, location, created_at, updated_at, feedstock_composition, temperature_log, moisture_readings, cohort_id, produced_by, production_date, quantity_kg) FROM stdin;
1	BATCH-2024-001	83.00	500.00	\N	2024-01-01	2024-03-31	completed	\N	2026-01-31 15:28:07.779822	2026-01-31 15:28:07.779822	\N	[]	[]	\N	\N	2026-02-03	0.00
2	BATCH-2024-002	87.00	844.00	\N	2024-02-01	2024-05-01	completed	\N	2026-01-31 15:28:07.788263	2026-01-31 15:28:07.788263	\N	[]	[]	\N	\N	2026-02-03	0.00
3	BATCH-2024-003	80.00	741.00	\N	2024-03-01	2024-05-30	completed	\N	2026-01-31 15:28:07.789376	2026-01-31 15:28:07.789376	\N	[]	[]	\N	\N	2026-02-03	0.00
4	BATCH-2024-004	75.00	996.00	\N	2024-04-01	2024-06-30	completed	\N	2026-01-31 15:28:07.79004	2026-01-31 15:28:07.79004	\N	[]	[]	\N	\N	2026-02-03	0.00
5	BATCH-2024-005	70.00	568.00	\N	2024-05-01	2024-07-30	completed	\N	2026-01-31 15:28:07.790768	2026-01-31 15:28:07.790768	\N	[]	[]	\N	\N	2026-02-03	0.00
6	BATCH-2024-006	94.00	724.00	\N	2024-06-01	2024-08-30	completed	\N	2026-01-31 15:28:07.791443	2026-01-31 15:28:07.791443	\N	[]	[]	\N	\N	2026-02-03	0.00
7	BATCH-2024-007	85.00	413.00	\N	2024-07-01	2024-09-29	completed	\N	2026-01-31 15:28:07.792311	2026-01-31 15:28:07.792311	\N	[]	[]	\N	\N	2026-02-03	0.00
8	BATCH-2024-008	77.00	799.00	\N	2024-08-01	2024-10-30	completed	\N	2026-01-31 15:28:07.793287	2026-01-31 15:28:07.793287	\N	[]	[]	\N	\N	2026-02-03	0.00
9	BATCH-2024-009	87.00	455.00	\N	2024-09-01	2024-11-30	completed	\N	2026-01-31 15:28:07.794561	2026-01-31 15:28:07.794561	\N	[]	[]	\N	\N	2026-02-03	0.00
10	BATCH-2024-010	98.00	701.00	\N	2024-10-01	2024-12-30	completed	\N	2026-01-31 15:28:07.795521	2026-01-31 15:28:07.795521	\N	[]	[]	\N	\N	2026-02-03	0.00
11	BATCH-2024-011	71.00	848.00	\N	2024-11-01	2025-01-30	in_progress	\N	2026-01-31 15:28:07.796591	2026-01-31 15:28:07.796591	\N	[]	[]	\N	\N	2026-02-03	0.00
12	BATCH-2024-012	91.00	724.00	\N	2024-12-01	2025-03-01	in_progress	\N	2026-01-31 15:28:07.797493	2026-01-31 15:28:07.797493	\N	[]	[]	\N	\N	2026-02-03	0.00
19	COMP-2026-001	8.50	\N	\N	2026-01-05	2026-02-20	Mature	\N	2026-02-03 16:18:26.668608	2026-02-03 16:18:26.668608	\N	[]	[]	1	1	2026-01-05	450.00
20	COMP-2026-002	\N	\N	\N	2026-01-15	2026-03-01	Curing	\N	2026-02-03 16:18:26.668608	2026-02-03 16:18:26.668608	\N	[]	[]	2	1	2026-01-15	480.00
21	COMP-2026-003	\N	\N	\N	2026-01-22	2026-03-08	In Progress	\N	2026-02-03 16:18:26.668608	2026-02-03 16:18:26.668608	\N	[]	[]	3	1	2026-01-22	0.00
\.


--
-- Data for Name: compost_feedstock_items; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.compost_feedstock_items (id, batch_id, material_type, percentage, kg_amount, cost_per_kg, created_at) FROM stdin;
13	19	Maize Stalks	40.00	200.00	50.00	2026-02-03 16:18:26.668608
14	19	Banana Leaves	30.00	150.00	30.00	2026-02-03 16:18:26.668608
15	19	Coffee Pulp	20.00	100.00	40.00	2026-02-03 16:18:26.668608
16	19	Avocado Prunings	10.00	50.00	35.00	2026-02-03 16:18:26.668608
17	20	Maize Stalks	50.00	250.00	50.00	2026-02-03 16:18:26.668608
18	20	Banana Leaves	30.00	150.00	30.00	2026-02-03 16:18:26.668608
19	20	Bean Stalks	20.00	100.00	45.00	2026-02-03 16:18:26.668608
20	21	Coffee Pulp	60.00	300.00	40.00	2026-02-03 16:18:26.668608
21	21	Banana Leaves	40.00	200.00	30.00	2026-02-03 16:18:26.668608
\.


--
-- Data for Name: compost_sales; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.compost_sales (id, batch_id, buyer_name, buyer_contact, kg_sold, price_per_kg, sale_date, payment_method, payment_reference, created_at, created_by) FROM stdin;
1	19	Kigali Urban Farms	+250 788 123 456	150.00	600.00	2026-01-28	Mobile Money	\N	2026-02-03 16:18:26.668608	1
\.


--
-- Data for Name: compost_workdays; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.compost_workdays (id, farmer_id, batch_id, hours_worked, stipend_amount, payment_status, payment_date, created_at, worker_id, date_worked, daily_wage) FROM stdin;
\.


--
-- Data for Name: farmers; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.farmers (id, cohort_id, vsla_id, full_name, phone, date_of_birth, gender, household_type, location_coordinates, plot_size_hectares, is_active, created_at, updated_at, plot_boundary_coordinates, plot_area_hectares, crops, co_crops, photo_url) FROM stdin;
\.


--
-- Data for Name: input_invoices; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.input_invoices (id, farmer_id, input_type, quantity, unit_price, total_cost, invoice_date, payment_status, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.inventory_transactions (id, facility_id, crop_type, quantity_kg, direction, reason, quality_grade, temperature_at_transaction, related_farmer_id, related_order_id, notes, status, created_by, created_at) FROM stdin;
13	7	vegetables	5000.00	incoming	harvest	B	20.00	\N	\N	gdwqasd	completed	1	2026-02-04 10:52:21.868612
14	7	vegetables	200.00	outgoing	sale	\N	\N	\N	\N	\N	completed	1	2026-02-04 10:53:05.914896
\.


--
-- Data for Name: learning_materials; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.learning_materials (id, title, category, file_type, file_url, version, description, download_count, uploaded_by, created_at, updated_at) FROM stdin;
1	Compost Quality Guide	Compost	PDF	/materials/compost-quality-guide.pdf	2.1	Comprehensive guide to assessing compost quality	89	1	2026-02-04 01:19:43.632143	2026-02-04 01:19:43.632143
2	Avocado Pruning Video	Agronomy	Video	/materials/avocado-pruning-video.video	1.0	Step-by-step video on proper avocado pruning	53	1	2026-02-04 01:19:43.635731	2026-02-04 01:19:43.635731
3	VSLA Handbook	VSLA	PDF	/materials/vsla-handbook.pdf	3.0	Complete VSLA operations manual	108	1	2026-02-04 01:19:43.636277	2026-02-04 01:19:43.636277
4	Nutrition Guide	Nutrition	PDF	/materials/nutrition-guide.pdf	1.5	Family nutrition and meal planning guide	0	1	2026-02-04 01:19:43.637421	2026-02-04 01:19:43.637421
5	Pest Management Poster	Agronomy	Image	/materials/pest-management-poster.image	1.0	Visual guide to common pests and solutions	59	1	2026-02-04 01:19:43.63798	2026-02-04 01:19:43.63798
6	Soil Health Audio Course	Agronomy	Audio	/materials/soil-health-audio-course.audio	1.0	Audio lessons on soil health (Kinyarwanda)	143	1	2026-02-04 01:19:43.638498	2026-02-04 01:19:43.638498
7	Recipe Cards Collection	Nutrition	PDF	/materials/recipe-cards-collection.pdf	2.0	Nutritious recipes using local ingredients	13	1	2026-02-04 01:19:43.638988	2026-02-04 01:19:43.638988
8	Champion Training Manual	Business Skills	PDF	/materials/champion-training-manual.pdf	1.0	Peer mentoring and facilitation skills	120	1	2026-02-04 01:19:43.639319	2026-02-04 01:19:43.639319
9	Fertilizer Application Chart	Agronomy	Image	/materials/fertilizer-application-chart.image	1.2	Crop-specific fertilizer recommendations	121	1	2026-02-04 01:19:43.639625	2026-02-04 01:19:43.639625
10	Food Storage Best Practices	Nutrition	Video	/materials/food-storage-best-practices.video	1.0	Post-harvest storage techniques	63	1	2026-02-04 01:19:43.639924	2026-02-04 01:19:43.639924
\.


--
-- Data for Name: maintenance_records; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.maintenance_records (id, facility_id, issue_description, maintenance_type, cost, vendor_name, status, scheduled_date, completed_date, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: map_measurements; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.map_measurements (id, user_id, measurement_type, coordinates, calculated_value, unit, notes, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price, total_price, farmer_share, sanza_share, created_at) FROM stdin;
1	1	1	51	2000.00	102000.00	51000.00	51000.00	2026-02-03 01:31:19.245985
2	2	1	7	2000.00	14000.00	7000.00	7000.00	2026-02-03 02:02:58.758756
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.orders (id, order_number, customer_name, customer_phone, customer_email, customer_type, delivery_address, delivery_date, total_amount, payment_method, payment_status, order_status, tracking_number, notes, created_at, updated_at) FROM stdin;
2	AAY-2026-002	University of Rwanda	+250790311401	nlambert833@gmail.com	individual	bbnmb b	2026-02-09	14000.00	mobile_money	paid	processing	\N	Contact: Lambert NDACYAYISABA. b nbnbnbnbnb	2026-02-03 02:02:58.758756	2026-02-03 12:12:05.540205
1	AAY-2026-001	University of Rwanda	+250790311401	nlambert833@gmail.com	individual	4retgffdsdfv	2026-02-08	102000.00	mobile_money	paid	processing	\N	Contact: Lambert NDACYAYISABA. rtgfg	2026-02-03 01:31:19.245985	2026-02-03 12:12:57.083582
\.


--
-- Data for Name: post_harvest_losses; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.post_harvest_losses (id, transaction_id, loss_category, loss_quantity_kg, loss_value, root_cause, prevention_strategy, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.products (id, product_type, box_size, cohort_id, harvest_date, available_quantity, price_per_kg, total_price, description, certifications, status, created_at, updated_at, image_url) FROM stdin;
4	vegetables	5.00	1	2026-02-15	39	299.84	1499.20	bsnmnnsndv	["organic_compost", "women_led", "fair_trade"]	deleted	2026-02-03 12:46:29.994111	2026-02-03 12:49:34.456482	\N
1	avocado	5.00	1	2026-01-30	42	400.00	2000.00	bdasvbsand	["organic_compost"]	deleted	2026-02-03 01:26:06.088263	2026-02-03 12:49:37.655942	\N
5	avocado	10.00	1	2026-01-28	2000	500.00	5000.00	fdsadsfe	["organic_compost", "women_led", "fair_trade"]	active	2026-02-03 12:50:41.477566	2026-02-03 13:02:20.496233	/uploads/products/product-1770116540468-386686024.png
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.quiz_questions (id, quiz_id, question_text, options, correct_answer, points, explanation, created_at) FROM stdin;
\.


--
-- Data for Name: quiz_results; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.quiz_results (id, quiz_id, farmer_id, score, passed, answers, submission_method, submitted_at) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.quizzes (id, session_id, title, category, passing_score, total_points, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.sales (id, farmer_id, crop_type, quantity_kg, gross_revenue, input_cost, net_revenue, farmer_share, sanza_share, sale_date, buyer_name, notes, created_at) FROM stdin;
\.


--
-- Data for Name: storage_facilities; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.storage_facilities (id, name, type, location_name, location_lat, location_lng, capacity_kg, current_usage_kg, temperature_celsius, humidity_percent, status, maintenance_due_date, last_maintenance_date, created_at, updated_at, description, temperature_min, temperature_max) FROM stdin;
7	kanombe   facility	insulated_shed	\N	-1.97264600	30.11092900	19999.99	4800.00	\N	\N	operational	\N	\N	2026-02-04 10:50:52.947744	2026-02-04 10:53:05.919372	perfect  	\N	\N
8	kabuga	cold_room	\N	-1.72337300	30.12553900	50000.00	0.00	\N	\N	operational	\N	\N	2026-02-04 11:26:22.875692	2026-02-04 12:59:24.350303		20.00	30.00
9	Kanyonyomba 	ambient_storage	nyarugenge 	-1.61293600	30.39953200	100000.00	0.00	\N	\N	operational	\N	\N	2026-02-04 13:29:34.019626	2026-02-04 13:29:34.019626	\N	\N	\N
\.


--
-- Data for Name: temperature_logs; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.temperature_logs (id, facility_id, temperature_celsius, humidity_percent, alert_triggered, recorded_at) FROM stdin;
\.


--
-- Data for Name: training_attendance; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.training_attendance (id, session_id, farmer_id, attendance_status, check_in_method, check_in_time, childcare_used, feedback_score, notes, created_at) FROM stdin;
\.


--
-- Data for Name: training_sessions; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.training_sessions (id, title, cohort_id, trainer_id, session_type, date, duration_hours, location, childcare_provided, materials, expected_attendees, actual_attendees, status, notes, created_at, updated_at) FROM stdin;
1	Water Conservation Techniques	1	1	Master Training	2026-01-21 02:00:00	2.2	Cohort 1 Farm	t	["Water Conservation Techniques Guide v2.0", "Visual Aids"]	29	29	Completed	High engagement from participants	2026-02-04 01:19:43.390434	2026-02-04 01:19:43.390434
2	Field Demonstration Methods	2	1	Champion Training	2026-01-26 02:00:00	2.6	Cohort 2 Farm	t	["Field Demonstration Methods Handbook", "Demonstration Kit"]	25	24	Completed	High engagement from participants	2026-02-04 01:19:43.423229	2026-02-04 01:19:43.423229
3	Savings Group Formation	3	1	VSLA	2026-01-29 02:00:00	2.9	Cohort 3 Farm	t	["VSLA Handbook", "Passbooks", "Calculator Sheets"]	26	24	Completed	High engagement from participants	2026-02-04 01:19:43.446263	2026-02-04 01:19:43.446263
4	Balanced Diet Planning	4	1	Nutrition	2026-02-03 02:00:00	3.4	Cohort 4 Farm	f	["Nutrition Guide", "Recipe Cards", "Food Charts"]	20	18	Completed	High engagement from participants	2026-02-04 01:19:43.450074	2026-02-04 01:19:43.450074
5	Seed Selection	1	1	Agronomy	2026-02-10 02:00:00	3.4	Community Center	t	["Seed Selection Manual", "Field Tools"]	21	17	Completed	High engagement from participants	2026-02-04 01:19:43.453163	2026-02-04 01:19:43.453163
6	Organic Pest Management	2	1	Master Training	2026-02-14 02:00:00	2.7	Field Demonstration Plot	f	["Organic Pest Management Guide v2.0", "Visual Aids"]	25	22	Completed	High engagement from participants	2026-02-04 01:19:43.456244	2026-02-04 01:19:43.456244
7	Compost Quality Assessment	3	1	Champion Training	2026-02-19 02:00:00	3.0	Cohort 1 Farm	t	["Compost Quality Assessment Handbook", "Demonstration Kit"]	27	24	Completed	High engagement from participants	2026-02-04 01:19:43.4595	2026-02-04 01:19:43.4595
8	VSLA Loan Management	4	1	VSLA	2026-02-22 02:00:00	2.2	Cohort 2 Farm	t	["VSLA Handbook", "Passbooks", "Calculator Sheets"]	29	27	Completed	High engagement from participants	2026-02-04 01:19:43.462039	2026-02-04 01:19:43.462039
9	Food Preparation and Storage	1	1	Nutrition	2026-02-26 02:00:00	2.2	Cohort 3 Farm	t	["Nutrition Guide", "Recipe Cards", "Food Charts"]	21	21	Completed	High engagement from participants	2026-02-04 01:19:43.464647	2026-02-04 01:19:43.464647
10	Fertilizer Application	2	1	Agronomy	2026-03-01 02:00:00	3.3	Cohort 4 Farm	t	["Fertilizer Application Manual", "Field Tools"]	28	28	Completed	High engagement from participants	2026-02-04 01:19:43.467824	2026-02-04 01:19:43.467824
11	Organic Pest Management	3	1	Master Training	2026-03-04 02:00:00	2.7	Community Center	t	["Organic Pest Management Guide v2.0", "Visual Aids"]	22	20	Completed	High engagement from participants	2026-02-04 01:19:43.470524	2026-02-04 01:19:43.470524
12	Peer Mentoring Skills	4	1	Champion Training	2026-03-07 02:00:00	2.1	Field Demonstration Plot	t	["Peer Mentoring Skills Handbook", "Demonstration Kit"]	27	25	Completed	High engagement from participants	2026-02-04 01:19:43.473744	2026-02-04 01:19:43.473744
13	Financial Record Keeping	1	1	VSLA	2026-03-14 02:00:00	3.2	Cohort 1 Farm	t	["VSLA Handbook", "Passbooks", "Calculator Sheets"]	24	22	Completed	High engagement from participants	2026-02-04 01:19:43.475766	2026-02-04 01:19:43.475766
14	Nutrition and Food Security	2	1	Nutrition	2026-03-21 02:00:00	3.1	Cohort 2 Farm	t	["Nutrition Guide", "Recipe Cards", "Food Charts"]	28	24	Completed	High engagement from participants	2026-02-04 01:19:43.477161	2026-02-04 01:19:43.477161
15	Seed Selection	3	1	Agronomy	2026-03-26 02:00:00	3.3	Cohort 3 Farm	f	["Seed Selection Manual", "Field Tools"]	28	26	Completed	High engagement from participants	2026-02-04 01:19:43.478567	2026-02-04 01:19:43.478567
16	Organic Pest Management	4	1	Master Training	2026-04-01 02:00:00	2.2	Cohort 4 Farm	f	["Organic Pest Management Guide v2.0", "Visual Aids"]	24	23	Completed	High engagement from participants	2026-02-04 01:19:43.479839	2026-02-04 01:19:43.479839
17	Compost Quality Assessment	1	1	Champion Training	2026-04-07 02:00:00	2.6	Community Center	t	["Compost Quality Assessment Handbook", "Demonstration Kit"]	21	21	Completed	High engagement from participants	2026-02-04 01:19:43.482354	2026-02-04 01:19:43.482354
18	Financial Record Keeping	2	1	VSLA	2026-04-13 02:00:00	2.9	Field Demonstration Plot	f	["VSLA Handbook", "Passbooks", "Calculator Sheets"]	20	19	Completed	High engagement from participants	2026-02-04 01:19:43.484508	2026-02-04 01:19:43.484508
19	Food Preparation and Storage	3	1	Nutrition	2026-04-19 02:00:00	2.9	Cohort 1 Farm	f	["Nutrition Guide", "Recipe Cards", "Food Charts"]	28	0	Scheduled	\N	2026-02-04 01:19:43.486388	2026-02-04 01:19:43.486388
20	Fertilizer Application	4	1	Agronomy	2026-04-25 02:00:00	3.0	Cohort 2 Farm	t	["Fertilizer Application Manual", "Field Tools"]	21	0	Scheduled	\N	2026-02-04 01:19:43.488449	2026-02-04 01:19:43.488449
21	Organic Pest Management	1	1	Master Training	2026-04-29 02:00:00	3.1	Cohort 3 Farm	f	["Organic Pest Management Guide v2.0", "Visual Aids"]	26	0	Scheduled	\N	2026-02-04 01:19:43.489634	2026-02-04 01:19:43.489634
22	Field Demonstration Methods	2	1	Champion Training	2026-05-06 02:00:00	3.3	Cohort 4 Farm	t	["Field Demonstration Methods Handbook", "Demonstration Kit"]	26	0	Scheduled	\N	2026-02-04 01:19:43.490753	2026-02-04 01:19:43.490753
23	Savings Group Formation	3	1	VSLA	2026-05-13 02:00:00	2.9	Community Center	f	["VSLA Handbook", "Passbooks", "Calculator Sheets"]	26	0	Scheduled	\N	2026-02-04 01:19:43.492087	2026-02-04 01:19:43.492087
24	Balanced Diet Planning	4	1	Nutrition	2026-05-20 02:00:00	3.3	Field Demonstration Plot	t	["Nutrition Guide", "Recipe Cards", "Food Charts"]	27	0	Scheduled	\N	2026-02-04 01:19:43.493264	2026-02-04 01:19:43.493264
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.users (id, full_name, email, phone, password_hash, role, language, is_active, created_at, updated_at, last_login, registration_status, registration_notes, requested_role, registration_date, approved_by, approved_at) FROM stdin;
2	NDACYAYISABA Lambert	nlambert833@gmail.com	\N	$2a$12$DYp0WkiCA21MWoadODsyeeHrvM3cljDC/2ymDfEKox/VK2KK2KOGS	agronomist	en	t	2026-02-05 12:08:47.367368	2026-02-05 12:08:47.367368	2026-02-05 12:46:23.026785	approved	\N	\N	2026-02-05 12:08:47.367368	\N	2026-02-05 12:08:47.367368
4	senadata Placide	placidesenadata35@gmail.com	\N	$2a$12$pEge/Ba5bCuRuVwSzHkM8OFhPdBVenCfyYYPbVf37.iQJZc8aSHE2	field_facilitator	en	t	2026-02-05 13:50:28.126083	2026-02-05 13:50:28.126083	2026-02-05 13:51:50.843123	approved	\N	\N	2026-02-05 13:50:28.126083	\N	2026-02-05 13:50:28.126083
1	System Admin	admin@aaywa.rw	\N	$2a$12$M9fkqh9sFPjmvr1xZFVrU.NWkrJ3nePmTBLLc3ZNCeXRICFT.nxTC	project_manager	en	t	2026-01-31 11:58:50.32226	2026-01-31 11:58:50.32226	2026-02-05 18:16:32.940038	approved	\N	\N	2026-01-31 11:58:50.32226	\N	2026-01-31 11:58:50.32226
\.


--
-- Data for Name: vsla_constitutions; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.vsla_constitutions (id, vsla_id, content, version, created_at) FROM stdin;
\.


--
-- Data for Name: vsla_groups; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.vsla_groups (id, cohort_id, name, seed_capital, total_savings, member_count, meeting_day, created_at, updated_at, maintenance_fund) FROM stdin;
3	3	VSLA Group - Cohort 3	12000.00	0.00	25	\N	2026-01-31 15:28:07.494731	2026-01-31 15:28:07.702819	0.00
1	1	VSLA Group - Cohort 1	12000.00	0.00	25	\N	2026-01-31 15:28:07.486549	2026-01-31 15:28:07.574859	0.00
4	4	VSLA Group - Cohort 4	12000.00	0.00	25	\N	2026-01-31 15:28:07.495283	2026-01-31 15:28:07.774067	0.00
2	2	VSLA Group - Cohort 2	12000.00	0.00	25	\N	2026-01-31 15:28:07.494059	2026-01-31 15:28:07.6367	0.00
\.


--
-- Data for Name: vsla_members; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.vsla_members (id, vsla_id, farmer_id, role, opening_savings, current_balance, joined_at, is_active) FROM stdin;
\.


--
-- Data for Name: vsla_officer_history; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.vsla_officer_history (id, vsla_id, member_id, role, start_date, end_date, created_at) FROM stdin;
\.


--
-- Data for Name: vsla_transactions; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.vsla_transactions (id, vsla_id, member_id, type, amount, balance_after, description, status, created_at, repayment_date, interest_rate, work_type, days_worked, vendor_name, receipt_url, sale_reference, linked_loan_id) FROM stdin;
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: aaywa_user
--

COPY public.warehouses (id, name, location, capacity_kg, current_stock_kg, manager_id, coordinates, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Name: aggregation_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.aggregation_centers_id_seq', 1, true);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.alerts_id_seq', 1, false);


--
-- Name: catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.catalog_id_seq', 1, false);


--
-- Name: champions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.champions_id_seq', 1, false);


--
-- Name: cohorts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.cohorts_id_seq', 4, true);


--
-- Name: compost_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.compost_batches_id_seq', 21, true);


--
-- Name: compost_feedstock_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.compost_feedstock_items_id_seq', 21, true);


--
-- Name: compost_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.compost_sales_id_seq', 1, true);


--
-- Name: compost_workdays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.compost_workdays_id_seq', 1, false);


--
-- Name: farmers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.farmers_id_seq', 1, false);


--
-- Name: input_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.input_invoices_id_seq', 1, false);


--
-- Name: inventory_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.inventory_transactions_id_seq', 14, true);


--
-- Name: learning_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.learning_materials_id_seq', 10, true);


--
-- Name: maintenance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.maintenance_records_id_seq', 3, true);


--
-- Name: map_measurements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.map_measurements_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.order_items_id_seq', 2, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 2, true);


--
-- Name: post_harvest_losses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.post_harvest_losses_id_seq', 2, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.products_id_seq', 5, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 1, false);


--
-- Name: quiz_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.quiz_results_id_seq', 1, false);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 1, false);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.sales_id_seq', 1, false);


--
-- Name: storage_facilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.storage_facilities_id_seq', 9, true);


--
-- Name: temperature_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.temperature_logs_id_seq', 84, true);


--
-- Name: training_attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.training_attendance_id_seq', 1, false);


--
-- Name: training_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.training_sessions_id_seq', 24, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: vsla_constitutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.vsla_constitutions_id_seq', 1, false);


--
-- Name: vsla_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.vsla_groups_id_seq', 4, true);


--
-- Name: vsla_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.vsla_members_id_seq', 1, false);


--
-- Name: vsla_officer_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.vsla_officer_history_id_seq', 1, false);


--
-- Name: vsla_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.vsla_transactions_id_seq', 1, false);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aaywa_user
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- Name: aggregation_centers aggregation_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.aggregation_centers
    ADD CONSTRAINT aggregation_centers_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: catalog catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.catalog
    ADD CONSTRAINT catalog_pkey PRIMARY KEY (id);


--
-- Name: champions champions_farmer_id_key; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.champions
    ADD CONSTRAINT champions_farmer_id_key UNIQUE (farmer_id);


--
-- Name: champions champions_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.champions
    ADD CONSTRAINT champions_pkey PRIMARY KEY (id);


--
-- Name: cohorts cohorts_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.cohorts
    ADD CONSTRAINT cohorts_pkey PRIMARY KEY (id);


--
-- Name: compost_batches compost_batches_batch_number_key; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_batches
    ADD CONSTRAINT compost_batches_batch_number_key UNIQUE (batch_number);


--
-- Name: compost_batches compost_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_batches
    ADD CONSTRAINT compost_batches_pkey PRIMARY KEY (id);


--
-- Name: compost_feedstock_items compost_feedstock_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_feedstock_items
    ADD CONSTRAINT compost_feedstock_items_pkey PRIMARY KEY (id);


--
-- Name: compost_sales compost_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_sales
    ADD CONSTRAINT compost_sales_pkey PRIMARY KEY (id);


--
-- Name: compost_workdays compost_workdays_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_workdays
    ADD CONSTRAINT compost_workdays_pkey PRIMARY KEY (id);


--
-- Name: farmers farmers_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_pkey PRIMARY KEY (id);


--
-- Name: input_invoices input_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.input_invoices
    ADD CONSTRAINT input_invoices_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: learning_materials learning_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.learning_materials
    ADD CONSTRAINT learning_materials_pkey PRIMARY KEY (id);


--
-- Name: maintenance_records maintenance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_pkey PRIMARY KEY (id);


--
-- Name: map_measurements map_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.map_measurements
    ADD CONSTRAINT map_measurements_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: post_harvest_losses post_harvest_losses_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.post_harvest_losses
    ADD CONSTRAINT post_harvest_losses_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_results quiz_results_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: storage_facilities storage_facilities_name_key; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.storage_facilities
    ADD CONSTRAINT storage_facilities_name_key UNIQUE (name);


--
-- Name: storage_facilities storage_facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.storage_facilities
    ADD CONSTRAINT storage_facilities_pkey PRIMARY KEY (id);


--
-- Name: temperature_logs temperature_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.temperature_logs
    ADD CONSTRAINT temperature_logs_pkey PRIMARY KEY (id);


--
-- Name: training_attendance training_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_attendance
    ADD CONSTRAINT training_attendance_pkey PRIMARY KEY (id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vsla_constitutions vsla_constitutions_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_constitutions
    ADD CONSTRAINT vsla_constitutions_pkey PRIMARY KEY (id);


--
-- Name: vsla_groups vsla_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_groups
    ADD CONSTRAINT vsla_groups_pkey PRIMARY KEY (id);


--
-- Name: vsla_members vsla_members_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_members
    ADD CONSTRAINT vsla_members_pkey PRIMARY KEY (id);


--
-- Name: vsla_officer_history vsla_officer_history_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_officer_history
    ADD CONSTRAINT vsla_officer_history_pkey PRIMARY KEY (id);


--
-- Name: vsla_transactions vsla_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_transactions
    ADD CONSTRAINT vsla_transactions_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: idx_aggregation_centers_location; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_aggregation_centers_location ON public.aggregation_centers USING btree (location_lat, location_lng);


--
-- Name: idx_alerts_created; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_alerts_created ON public.alerts USING btree (created_at DESC) WHERE (NOT dismissed);


--
-- Name: idx_alerts_dismissed; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_alerts_dismissed ON public.alerts USING btree (dismissed);


--
-- Name: idx_alerts_entity; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_alerts_entity ON public.alerts USING btree (entity_type, entity_id) WHERE (NOT dismissed);


--
-- Name: idx_alerts_severity; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_alerts_severity ON public.alerts USING btree (severity) WHERE (NOT dismissed);


--
-- Name: idx_alerts_type; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_alerts_type ON public.alerts USING btree (alert_type) WHERE (NOT dismissed);


--
-- Name: idx_champions_cohort; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_champions_cohort ON public.champions USING btree (cohort_id);


--
-- Name: idx_champions_farmer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_champions_farmer ON public.champions USING btree (farmer_id);


--
-- Name: idx_cohorts_boundary; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_cohorts_boundary ON public.cohorts USING gin (boundary_coordinates);


--
-- Name: idx_cohorts_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_cohorts_status ON public.cohorts USING btree (status);


--
-- Name: idx_cohorts_system; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_cohorts_system ON public.cohorts USING btree (cropping_system);


--
-- Name: idx_compost_batch_number; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_batch_number ON public.compost_batches USING btree (batch_number);


--
-- Name: idx_compost_batches_cohort; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_batches_cohort ON public.compost_batches USING btree (cohort_id);


--
-- Name: idx_compost_batches_dates; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_batches_dates ON public.compost_batches USING btree (start_date, maturity_date);


--
-- Name: idx_compost_batches_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_batches_status ON public.compost_batches USING btree (status);


--
-- Name: idx_compost_feedstock_batch_id; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_feedstock_batch_id ON public.compost_feedstock_items USING btree (batch_id);


--
-- Name: idx_compost_sales_batch_id; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_sales_batch_id ON public.compost_sales USING btree (batch_id);


--
-- Name: idx_compost_sales_date; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_sales_date ON public.compost_sales USING btree (sale_date);


--
-- Name: idx_compost_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_status ON public.compost_batches USING btree (status);


--
-- Name: idx_compost_workdays_batch_id; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_workdays_batch_id ON public.compost_workdays USING btree (batch_id);


--
-- Name: idx_compost_workdays_payment; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_workdays_payment ON public.compost_workdays USING btree (payment_status);


--
-- Name: idx_compost_workdays_worker_id; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_compost_workdays_worker_id ON public.compost_workdays USING btree (worker_id);


--
-- Name: idx_farmers_active; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_farmers_active ON public.farmers USING btree (is_active);


--
-- Name: idx_farmers_cohort; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_farmers_cohort ON public.farmers USING btree (cohort_id);


--
-- Name: idx_farmers_household; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_farmers_household ON public.farmers USING btree (household_type);


--
-- Name: idx_farmers_household_type; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_farmers_household_type ON public.farmers USING btree (household_type);


--
-- Name: idx_farmers_plot_boundary; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_farmers_plot_boundary ON public.farmers USING gin (plot_boundary_coordinates);


--
-- Name: idx_farmers_vsla; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_farmers_vsla ON public.farmers USING btree (vsla_id);


--
-- Name: idx_inputs_farmer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_inputs_farmer ON public.input_invoices USING btree (farmer_id);


--
-- Name: idx_inputs_type; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_inputs_type ON public.input_invoices USING btree (input_type);


--
-- Name: idx_learning_materials_category; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_learning_materials_category ON public.learning_materials USING btree (category);


--
-- Name: idx_maintenance_facility; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_maintenance_facility ON public.maintenance_records USING btree (facility_id);


--
-- Name: idx_maintenance_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_maintenance_status ON public.maintenance_records USING btree (status);


--
-- Name: idx_map_measurements_type; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_map_measurements_type ON public.map_measurements USING btree (measurement_type);


--
-- Name: idx_map_measurements_user; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_map_measurements_user ON public.map_measurements USING btree (user_id);


--
-- Name: idx_quiz_results_farmer_score; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_quiz_results_farmer_score ON public.quiz_results USING btree (farmer_id, score);


--
-- Name: idx_quiz_results_quiz; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_quiz_results_quiz ON public.quiz_results USING btree (quiz_id);


--
-- Name: idx_sales_crop; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_sales_crop ON public.sales USING btree (crop_type);


--
-- Name: idx_sales_date; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_sales_date ON public.sales USING btree (sale_date);


--
-- Name: idx_sales_farmer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_sales_farmer ON public.sales USING btree (farmer_id);


--
-- Name: idx_temp_logs_facility; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_temp_logs_facility ON public.temperature_logs USING btree (facility_id);


--
-- Name: idx_temp_logs_recorded; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_temp_logs_recorded ON public.temperature_logs USING btree (recorded_at DESC);


--
-- Name: idx_training_attendance_farmer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_training_attendance_farmer ON public.training_attendance USING btree (farmer_id);


--
-- Name: idx_training_attendance_session_farmer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_training_attendance_session_farmer ON public.training_attendance USING btree (session_id, farmer_id);


--
-- Name: idx_training_sessions_cohort_date; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_training_sessions_cohort_date ON public.training_sessions USING btree (cohort_id, date);


--
-- Name: idx_training_sessions_date; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_training_sessions_date ON public.training_sessions USING btree (date);


--
-- Name: idx_training_sessions_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_training_sessions_status ON public.training_sessions USING btree (status);


--
-- Name: idx_training_sessions_trainer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_training_sessions_trainer ON public.training_sessions USING btree (trainer_id);


--
-- Name: idx_transactions_created; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_transactions_created ON public.inventory_transactions USING btree (created_at DESC);


--
-- Name: idx_transactions_crop; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_transactions_crop ON public.inventory_transactions USING btree (crop_type);


--
-- Name: idx_transactions_facility; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_transactions_facility ON public.inventory_transactions USING btree (facility_id);


--
-- Name: idx_users_registration_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_users_registration_status ON public.users USING btree (registration_status);


--
-- Name: idx_vsla_cohort; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_vsla_cohort ON public.vsla_groups USING btree (cohort_id);


--
-- Name: idx_warehouse_manager; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_warehouse_manager ON public.warehouses USING btree (manager_id);


--
-- Name: idx_workdays_batch; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_workdays_batch ON public.compost_workdays USING btree (batch_id);


--
-- Name: idx_workdays_farmer; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_workdays_farmer ON public.compost_workdays USING btree (farmer_id);


--
-- Name: idx_workdays_status; Type: INDEX; Schema: public; Owner: aaywa_user
--

CREATE INDEX idx_workdays_status ON public.compost_workdays USING btree (payment_status);


--
-- Name: cohort_geo_summary _RETURN; Type: RULE; Schema: public; Owner: aaywa_user
--

CREATE OR REPLACE VIEW public.cohort_geo_summary AS
 SELECT c.id,
    c.name,
    c.cropping_system,
    c.boundary_coordinates,
    c.boundary_color,
    count(f.id) AS farmer_count,
    sum(f.plot_area_hectares) AS total_area_hectares
   FROM (public.cohorts c
     LEFT JOIN public.farmers f ON ((f.cohort_id = c.id)))
  WHERE (c.boundary_coordinates IS NOT NULL)
  GROUP BY c.id;


--
-- Name: facility_summary _RETURN; Type: RULE; Schema: public; Owner: aaywa_user
--

CREATE OR REPLACE VIEW public.facility_summary AS
 SELECT sf.id,
    sf.name,
    sf.type,
    sf.location_name,
    sf.capacity_kg,
    sf.current_usage_kg,
    sf.temperature_celsius,
    sf.humidity_percent,
    sf.status,
        CASE
            WHEN (sf.capacity_kg > (0)::numeric) THEN round(((sf.current_usage_kg / sf.capacity_kg) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS usage_percentage,
    count(DISTINCT it.id) AS transaction_count
   FROM (public.storage_facilities sf
     LEFT JOIN public.inventory_transactions it ON ((sf.id = it.facility_id)))
  GROUP BY sf.id;


--
-- Name: training_session_summary _RETURN; Type: RULE; Schema: public; Owner: aaywa_user
--

CREATE OR REPLACE VIEW public.training_session_summary AS
 SELECT ts.id,
    ts.title,
    ts.cohort_id,
    c.name AS cohort_name,
    ts.trainer_id,
    u.full_name AS trainer_name,
    ts.session_type,
    ts.date,
    ts.duration_hours,
    ts.location,
    ts.childcare_provided,
    ts.materials,
    ts.expected_attendees,
    ts.actual_attendees,
        CASE
            WHEN (ts.expected_attendees > 0) THEN round((((ts.actual_attendees)::numeric / (ts.expected_attendees)::numeric) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS attendance_rate,
    ts.status,
    ts.notes,
    ts.created_at,
    ts.updated_at,
    count(DISTINCT ta.id) AS attendance_records,
    avg(ta.feedback_score) AS avg_feedback
   FROM (((public.training_sessions ts
     LEFT JOIN public.cohorts c ON ((ts.cohort_id = c.id)))
     LEFT JOIN public.users u ON ((ts.trainer_id = u.id)))
     LEFT JOIN public.training_attendance ta ON ((ts.id = ta.session_id)))
  GROUP BY ts.id, c.name, u.full_name;


--
-- Name: alerts update_alerts_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: champions update_champions_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_champions_updated_at BEFORE UPDATE ON public.champions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cohorts update_cohorts_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON public.cohorts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: compost_batches update_compost_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_compost_updated_at BEFORE UPDATE ON public.compost_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: farmers update_farmers_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON public.farmers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: learning_materials update_learning_materials_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_learning_materials_updated_at BEFORE UPDATE ON public.learning_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quizzes update_quizzes_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: storage_facilities update_storage_facilities_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_storage_facilities_updated_at BEFORE UPDATE ON public.storage_facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: training_sessions update_training_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON public.training_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vsla_groups update_vsla_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_vsla_updated_at BEFORE UPDATE ON public.vsla_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: warehouses update_warehouses_updated_at; Type: TRIGGER; Schema: public; Owner: aaywa_user
--

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: alerts alerts_dismissed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_dismissed_by_fkey FOREIGN KEY (dismissed_by) REFERENCES public.users(id);


--
-- Name: champions champions_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.champions
    ADD CONSTRAINT champions_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id);


--
-- Name: champions champions_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.champions
    ADD CONSTRAINT champions_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: compost_batches compost_batches_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_batches
    ADD CONSTRAINT compost_batches_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id);


--
-- Name: compost_batches compost_batches_produced_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_batches
    ADD CONSTRAINT compost_batches_produced_by_fkey FOREIGN KEY (produced_by) REFERENCES public.users(id);


--
-- Name: compost_feedstock_items compost_feedstock_items_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_feedstock_items
    ADD CONSTRAINT compost_feedstock_items_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.compost_batches(id) ON DELETE CASCADE;


--
-- Name: compost_sales compost_sales_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_sales
    ADD CONSTRAINT compost_sales_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.compost_batches(id);


--
-- Name: compost_sales compost_sales_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_sales
    ADD CONSTRAINT compost_sales_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: compost_workdays compost_workdays_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_workdays
    ADD CONSTRAINT compost_workdays_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.compost_batches(id) ON DELETE CASCADE;


--
-- Name: compost_workdays compost_workdays_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_workdays
    ADD CONSTRAINT compost_workdays_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id) ON DELETE CASCADE;


--
-- Name: compost_workdays compost_workdays_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.compost_workdays
    ADD CONSTRAINT compost_workdays_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.users(id);


--
-- Name: farmers farmers_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id);


--
-- Name: farmers farmers_vsla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_vsla_id_fkey FOREIGN KEY (vsla_id) REFERENCES public.vsla_groups(id);


--
-- Name: input_invoices input_invoices_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.input_invoices
    ADD CONSTRAINT input_invoices_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: inventory_transactions inventory_transactions_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.storage_facilities(id) ON DELETE CASCADE;


--
-- Name: learning_materials learning_materials_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.learning_materials
    ADD CONSTRAINT learning_materials_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: maintenance_records maintenance_records_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.storage_facilities(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: post_harvest_losses post_harvest_losses_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.post_harvest_losses
    ADD CONSTRAINT post_harvest_losses_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.inventory_transactions(id) ON DELETE CASCADE;


--
-- Name: products products_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id);


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_results quiz_results_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: quiz_results quiz_results_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quiz_results
    ADD CONSTRAINT quiz_results_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: quizzes quizzes_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.training_sessions(id) ON DELETE SET NULL;


--
-- Name: sales sales_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id) ON DELETE CASCADE;


--
-- Name: temperature_logs temperature_logs_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.temperature_logs
    ADD CONSTRAINT temperature_logs_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.storage_facilities(id) ON DELETE CASCADE;


--
-- Name: training_attendance training_attendance_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_attendance
    ADD CONSTRAINT training_attendance_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: training_attendance training_attendance_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_attendance
    ADD CONSTRAINT training_attendance_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.training_sessions(id) ON DELETE CASCADE;


--
-- Name: training_sessions training_sessions_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id);


--
-- Name: training_sessions training_sessions_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.users(id);


--
-- Name: users users_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: vsla_constitutions vsla_constitutions_vsla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_constitutions
    ADD CONSTRAINT vsla_constitutions_vsla_id_fkey FOREIGN KEY (vsla_id) REFERENCES public.vsla_groups(id);


--
-- Name: vsla_groups vsla_groups_cohort_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_groups
    ADD CONSTRAINT vsla_groups_cohort_id_fkey FOREIGN KEY (cohort_id) REFERENCES public.cohorts(id) ON DELETE CASCADE;


--
-- Name: vsla_members vsla_members_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_members
    ADD CONSTRAINT vsla_members_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: vsla_members vsla_members_vsla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_members
    ADD CONSTRAINT vsla_members_vsla_id_fkey FOREIGN KEY (vsla_id) REFERENCES public.vsla_groups(id);


--
-- Name: vsla_officer_history vsla_officer_history_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_officer_history
    ADD CONSTRAINT vsla_officer_history_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.vsla_members(id);


--
-- Name: vsla_officer_history vsla_officer_history_vsla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_officer_history
    ADD CONSTRAINT vsla_officer_history_vsla_id_fkey FOREIGN KEY (vsla_id) REFERENCES public.vsla_groups(id);


--
-- Name: vsla_transactions vsla_transactions_linked_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_transactions
    ADD CONSTRAINT vsla_transactions_linked_loan_id_fkey FOREIGN KEY (linked_loan_id) REFERENCES public.vsla_transactions(id);


--
-- Name: vsla_transactions vsla_transactions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_transactions
    ADD CONSTRAINT vsla_transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.vsla_members(id);


--
-- Name: vsla_transactions vsla_transactions_vsla_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.vsla_transactions
    ADD CONSTRAINT vsla_transactions_vsla_id_fkey FOREIGN KEY (vsla_id) REFERENCES public.vsla_groups(id);


--
-- Name: warehouses warehouses_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aaywa_user
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO aaywa_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 5DsRNlLqyACkSsgyVH1b1UgbWb4EwTXW0GpJrhszbFT4CmwSI3dhMSopdrgkGfr

