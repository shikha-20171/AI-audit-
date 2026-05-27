# Metrics

The North Star metric for this product should be `qualified savings audits per week`. I would define that as completed audits from teams with at least $500/month in verified savings potential or sufficiently large recurring API spend to justify a Credex follow-up. That metric is better than raw signups or DAU because this is not a consumer habit product. The tool succeeds when it reliably creates high-intent, economically meaningful leads.

The three input metrics that matter most are:

1. Landing visitor to audit completion rate
2. Audit completion to email capture rate
3. Percentage of completed audits that cross the “qualified” threshold

Those three numbers tell you whether the page converts, whether the result earns trust, and whether the traffic is commercially useful.

The first instrumentation I would add is event tracking around:

- landing page view
- tool row activation
- audit submit
- audit completed
- share link copied
- lead form submitted
- public report viewed

I would also log audit characteristics like tool mix, monthly savings bucket, and use case so Credex can understand which segments actually produce consult-worthy opportunities.

The pivot number I would watch is the share of completed audits that qualify for follow-up. If fewer than 10% of completed audits produce either $500+/month in savings or a strong API-credit opportunity after the first few hundred completions, I would reconsider the positioning. That would suggest the audience is too broad, the product is attracting low-value hobby traffic, or the audit logic is not exposing the right commercial wedge.
