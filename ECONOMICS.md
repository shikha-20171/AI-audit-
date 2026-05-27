# Economics

To judge whether this tool is worthwhile for Credex, the key question is not “how many people use it?” but “how much gross profit does one converted lead create?” I would model it from the credit-purchase side. Suppose a qualified startup ends up buying $30,000 of discounted AI credits over a year through Credex. If Credex earns a blended 12% gross margin on that volume, the gross profit is about $3,600. Not every consultation closes, so the expected value per booked consultation is lower. If 25% of booked consultations convert to a purchase, then one booked consultation is worth about $900 in expected gross profit. If 20% of completed audits become consultations, then one completed audit is worth about $180 in expected gross profit.

CAC should be estimated by channel, even for “free” channels. Founder DM outreach is time-expensive: if one hour of outreach produces 4 completed audits and the operator time is valued at $50/hour, that is roughly $12.50 CAC per audit. Community posting in Indie Hackers or Slack groups might be cheaper, maybe $5–$10 CAC per audit if one strong post brings in 10–20 completions. Product Hunt and Hacker News are spikier; they can look almost free on a launch day, but if they require a full day of prep and yield 50 completed audits, the implied CAC may still be around $8–$15 per audit.

Using the expected value above, the funnel becomes attractive quickly. If an audit is worth $180 expected gross profit, even a $15 CAC leaves strong room. A reasonable profitability threshold could look like this:

- `audit completed -> consultation booked`: 10%
- `consultation booked -> credit purchase`: 20%
- `gross profit per purchase`: $3,600

Math: `100 audits * 10% * 20% * $3,600 = $72,000 gross profit per 100 audits`, or $720 expected gross profit per audit. Even if those assumptions are cut in half, the model can still work.

To drive $1M ARR in 18 months, the tool needs to influence a meaningful pipeline, not just collect emails. If average annual revenue per converted customer is $12,000 and Credex keeps enough margin for that to matter, then roughly 84 paying customers gets you to $1M ARR. If the funnel is 12% from audit to consultation and 20% from consultation to purchase, conversion from audit to customer is 2.4%. That means reaching 84 customers would require about 3,500 completed audits over 18 months, or roughly 195 audits per month. That is ambitious but plausible if Credex treats the tool like a serious acquisition surface rather than a side calculator.

The real sensitivity is not traffic. It is lead quality. If high-savings teams dominate completions, the economics are excellent. If the tool mainly attracts hobbyists saving $20/month, the funnel becomes content marketing instead of revenue. That is why the audit thresholding and CTA logic matter so much.
