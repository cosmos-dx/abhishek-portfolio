import { Reveal } from "@/components/Reveal";

const FLOW = [
  { t: "Clients", d: "Web, mobile, partners and staff tools." },
  { t: "Edge", d: "CDN, WAF, TLS termination and coarse rate limits." },
  { t: "API gateway", d: "Routing, authentication and authorisation, quotas, versioning." },
  { t: "Services", d: "Stateless, replicated domain services (identity, billing, notifications...)." },
  { t: "Event bus and workers", d: "Queues, retries with backoff, dead-letter handling, idempotent consumers." },
  { t: "Data", d: "Relational for transactions, document for flexible shapes, cache for hot reads, search indexes, object storage." },
  { t: "AI platform", d: "Model gateway, retrieval, agent harness and evals, called like any other dependency." },
  { t: "Cross-cutting", d: "Observability, security, delivery and autoscaling." },
];

const SCALE = [
  { t: "Stateless first", d: "Keep services free of local state and push session, cache and queue state outward. Any instance can serve any request, so scaling means adding replicas behind a load balancer, and losing a node costs nothing." },
  { t: "Cache in layers", d: "Serve from the edge, then in-process, then a shared cache, and only then the database. Decide per entity how stale is acceptable, and protect hot keys from stampedes by coalescing identical requests." },
  { t: "Async by default", d: "Anything a user does not wait for goes on a queue. Spikes turn into backlog instead of outages. Consumers are idempotent, retries back off, and poison messages land in a dead-letter queue to be inspected, not retried forever." },
  { t: "Shape data for the read", d: "Model writes for correctness and derive read models for speed: indexes that match real queries, read replicas, denormalised views, and partitioning by tenant or time once a single node stops being enough." },
  { t: "Protect the system from itself", d: "Rate limits, quotas, timeouts, circuit breakers and bulkheads. Under pressure, degrade on purpose (stale data, smaller pages, skipped enrichment) rather than failing everywhere at once." },
  { t: "Make it observable", d: "Structured logs, metrics and traces share one correlation ID. Define SLOs, alert on burn rate, and keep cost per request next to latency so problems surface before users report them." },
  { t: "Ship small and reversible", d: "Containers with real health checks, autoscaling on meaningful signals, canary or blue-green rollouts, feature flags, and migrations that are backward compatible so a rollback is always safe." },
  { t: "Boundaries follow ownership", d: "Start as a well-modularised system and split a service only when ownership, scaling profile or release cadence demands it. Contracts between services are typed and versioned, so teams move independently." },
  { t: "AI is a component, not the architecture", d: "Put models behind one gateway that owns routing, caching, fallbacks, budgets and logging. Retrieval is another data path with its own index, freshness and access rules. Agents run inside a harness: scoped tools, step and cost limits, and human checkpoints for risky actions." },
  { t: "Evaluate AI like any dependency", d: "Evals are tests: golden sets, regression runs on every prompt or model change, and sampling in production. Track quality, latency and cost per task so a cheaper model or a cache hit is a measured decision, not a hope." },
];

const box = "fill-none stroke-ink";
const dim = "fill-muted";
const node = "fill-[#faf9f5] stroke-line";

/** Conceptual map: SVG on md+, stacked flow on small screens. Deliberately generic, not one production system. */
export function Systems() {
  return (
    <section id="systems" aria-labelledby="systems-title" className="border-b border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <h2 id="systems-title" className="max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl">
          Products to scalable system backend, with AI aid.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          A generic map of how I think about building systems that grow: a request path that stays fast, an async path that absorbs load, data shaped for how it is read, and AI as one well-governed component among them.
        </p>

        <Reveal className="mt-10">
          <figure>
            <svg
              viewBox="0 0 1000 640"
              role="img"
              aria-label="Conceptual system architecture: clients, edge, API gateway, stateless services, event bus and workers, data stores, an AI platform, and observability, security and delivery layers."
              className="hidden h-auto w-full md:block"
            >
              <defs>
                <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
                  <circle cx="5" cy="5" r="4" className="fill-accent" />
                </marker>
              </defs>
              <g className="font-mono" fontSize="12" letterSpacing="1.2">
                {/* legend */}
                <line x1="20" y1="38" x2="60" y2="38" className="stroke-ink" strokeWidth="1" />
                <text x="72" y="42" className={dim}>sync request path</text>
                <line x1="20" y1="64" x2="60" y2="64" className="stroke-ink" strokeWidth="1" strokeDasharray="4 4" />
                <text x="72" y="68" className={dim}>async / events</text>

                {/* connectors */}
                <g className="fill-none stroke-ink" strokeWidth="1" markerEnd="url(#dot)">
                  <path d="M140 315 H160" />
                  <path d="M280 315 H305" />
                  <path d="M450 315 H470" />
                  <path d="M700 250 H740" />
                  <path d="M585 120 V150" />
                  <path d="M700 70 H860 V150" />
                </g>
                <g className="fill-none stroke-ink" strokeWidth="1" strokeDasharray="4 4" markerEnd="url(#dot)">
                  <path d="M585 360 V380" />
                  <path d="M585 420 V440" />
                  <path d="M700 475 H740" />
                </g>

                {/* clients */}
                <rect x="20" y="230" width="120" height="170" className={box} />
                <text x="35" y="255" className="fill-accent">CLIENTS</text>
                {["Web", "Mobile", "Partners", "Staff tools"].map((c, i) => (
                  <text key={c} x="35" y={290 + i * 28} className="fill-ink">{c}</text>
                ))}

                {/* edge */}
                <rect x="160" y="250" width="120" height="130" className={box} />
                <text x="175" y="275" className="fill-accent">EDGE</text>
                <text x="175" y="308" className="fill-ink">CDN · WAF</text>
                <text x="175" y="332" className={dim}>TLS · limits</text>

                {/* gateway */}
                <rect x="305" y="250" width="145" height="130" className={box} />
                <text x="320" y="275" className="fill-accent">GATEWAY</text>
                <text x="320" y="308" className="fill-ink">Routing</text>
                <text x="320" y="332" className={dim}>authN · authZ</text>
                <text x="320" y="352" className={dim}>quotas</text>

                {/* services */}
                <rect x="470" y="150" width="230" height="210" className={box} />
                <text x="485" y="175" className="fill-accent">SERVICES</text>
                {[
                  ["Domain", 485, 195],
                  ["Identity", 595, 195],
                  ["Billing", 485, 245],
                  ["Notify", 595, 245],
                ].map(([n, x, y]) => (
                  <g key={n as string}>
                    <rect x={x as number} y={y as number} width="95" height="40" className={node} />
                    <text x={(x as number) + 12} y={(y as number) + 25} className="fill-ink">{n}</text>
                  </g>
                ))}
                <text x="485" y="320" className={dim}>stateless · replicated</text>

                {/* bus + workers */}
                <rect x="470" y="380" width="230" height="40" className={box} />
                <text x="485" y="405" className="fill-ink">EVENT BUS · queues · DLQ</text>
                <rect x="470" y="440" width="230" height="70" className={box} />
                <text x="485" y="465" className="fill-accent">WORKERS</text>
                <text x="485" y="490" className={dim}>idempotent · retries</text>

                {/* AI platform */}
                <rect x="310" y="20" width="390" height="100" className="fill-dark stroke-dark" />
                <text x="325" y="45" className="fill-accent">AI PLATFORM</text>
                <text x="325" y="72" fill="#fff">Model gateway · Retrieval</text>
                <text x="325" y="98" fill="#aaa">Agent harness · Evals</text>

                {/* data */}
                <rect x="740" y="150" width="240" height="360" className={box} />
                <text x="755" y="175" className="fill-accent">DATA</text>
                {[
                  ["Relational", "transactions"],
                  ["Document", "flexible shapes"],
                  ["Cache", "hot reads"],
                  ["Search", "indexes"],
                  ["Object store", "files · reports"],
                ].map(([n, d], i) => (
                  <g key={n}>
                    <text x="755" y={208 + i * 61} className="fill-ink">{n}</text>
                    <text x="755" y={228 + i * 61} className={dim}>{d}</text>
                  </g>
                ))}

                {/* cross-cutting */}
                <rect x="20" y="535" width="960" height="38" className="fill-none stroke-line" strokeDasharray="4 4" />
                <text x="35" y="559" className="fill-accent">OBSERVABILITY</text>
                <text x="200" y="559" className={dim}>logs · metrics · traces · SLOs · cost per request</text>
                <rect x="20" y="585" width="470" height="38" className="fill-none stroke-line" strokeDasharray="4 4" />
                <text x="35" y="609" className="fill-accent">SECURITY</text>
                <text x="140" y="609" className={dim}>identity · secrets · audit</text>
                <rect x="510" y="585" width="470" height="38" className="fill-none stroke-line" strokeDasharray="4 4" />
                <text x="525" y="609" className="fill-accent">DELIVERY</text>
                <text x="625" y="609" className={dim}>CI/CD · autoscaling · canary</text>
              </g>
            </svg>

            <ol className="md:hidden">
              {FLOW.map((s, i) => (
                <li key={s.t} className="relative border-l border-ink pb-6 pl-6 last:pb-0">
                  <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 bg-accent" aria-hidden />
                  <div className="label text-muted">{String(i + 1).padStart(2, "0")}</div>
                  <div className="mt-1 font-semibold">{s.t}</div>
                  <div className="text-sm text-muted">{s.d}</div>
                </li>
              ))}
            </ol>

            <figcaption className="label mt-4 text-muted">Conceptual overview. Not a single production architecture.</figcaption>
          </figure>
        </Reveal>

        <div className="mt-16">
          <h3 className="label">How it scales</h3>
          <ul className="mt-4 grid border-l border-t border-line md:grid-cols-2">
            {SCALE.map((s) => (
              <li key={s.t} className="border-b border-r border-line p-5 sm:p-6">
                <h4 className="flex items-center gap-3 font-semibold tracking-tight">
                  <span className="h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />
                  {s.t}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
