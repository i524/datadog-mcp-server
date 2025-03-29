# Datadog Metrics Query Guide

This document explains the query syntax and fundamental concepts for retrieving metrics using the Datadog MCP Server.

For official information, see [Query Syntax](https://docs.datadoghq.com/tracing/trace_explorer/query_syntax/) and [Query to the Graph](https://docs.datadoghq.com/dashboards/guide/query-to-the-graph/).

## 1. Basic Structure of Metrics Queries

Datadog metrics queries follow this basic structure:

```
<aggregator>:<metric_name>{<scope>}[by {<grouping>}][.<modifier>()]
```

Example:
```
avg:system.cpu.user{host:web-server-1}.rollup(avg, 60)
```

## 2. Mental Model for Metrics Queries

To understand Datadog metrics queries, it's important to grasp these four key steps:

### 2.1 Timeseries Selection

- Metric data is stored as **separate timeseries for each tag combination**
- The **scope part** of a query (`{host:web-server-1}`) selects which timeseries to include
- Using wildcards like `{*}` or partial matches like `{host:web-*}` selects multiple timeseries
- Example: `system.disk.total{host:app-server}` selects all disk metrics from the host named "app-server"

### 2.2 Space Aggregation

- Space aggregation determines **how data from multiple timeseries is combined**
- The aggregator is specified as a **prefix** to the metric name with a colon separator
- Available aggregators:
  - `avg`: Average across all sources (default if not specified)
  - `sum`: Sum of all sources
  - `min`: Minimum value across all sources
  - `max`: Maximum value across all sources
  - `p50`, `p75`, `p90`, `p95`, `p99`: Percentile aggregations
- Example: `sum:system.cpu.user{*}` sums CPU usage across all hosts

### 2.3 Time Aggregation

- Datadog stores data at 1-second granularity but aggregates it for display
- Time aggregation determines **how data points are combined over time intervals**
- Default behavior: Datadog automatically selects appropriate time intervals based on the timeframe
- Can be controlled with the `rollup()` function
- Example: `avg:system.cpu.user{*}.rollup(avg, 60)` aggregates data into 60-second intervals using averages

### 2.4 Grouping (Optional)

- Grouping allows you to **maintain separate timeseries based on specific tags**
- Uses the `by {tag}` syntax
- Instead of aggregating everything into a single value, it creates multiple result lines
- Example: `sum:system.disk.in_use{*} by {device}` shows separate lines for each device

## 3. Query Components in Detail

### 3.1 Metric Names

- Must specify a valid metric name that exists in your Datadog account
- Examples: `system.cpu.user`, `http_requests`, `custom.metric.name`

### 3.2 Space Aggregator

- Specified as a prefix to the metric name: `sum:`, `avg:`, `min:`, `max:`, `p99:`, etc.
- If omitted, defaults to `avg:`
- Only applies when multiple timeseries are selected

### 3.3 Scope (Tag Filtering)

- Enclosed in curly braces: `{tag:value}`
- Multiple tags use comma separation: `{host:web-1, env:prod}`
- Supports wildcards: `{host:web-*}` or `{*}`
- Supports boolean operators: `{host:web-1 AND environment:production}`
- Supports exclusion: `{host:web-* AND NOT host:web-legacy}`

### 3.4 Grouping

- Uses `by {tag}` syntax
- Multiple grouping tags: `by {host,device}`
- Creates separate result lines for each unique tag value
- Example: `sum:system.cpu.user{*} by {host}` shows CPU usage per host

### 3.5 Time Aggregation (Rollup)

- Uses `.rollup(method, interval)` syntax
- Methods: `avg`, `sum`, `min`, `max`, `count`
- Interval in seconds
- Example: `.rollup(sum, 300)` for 5-minute sums

### 3.6 Special Modifiers

- `.as_count()`: Displays StatsD counters as raw counts
- `.as_rate()`: Displays StatsD counters as per-second rates
- `.fill(value)`: Fills missing data points with the specified value

## 4. Common Functions

Datadog supports various functions that can be applied to metrics:

### 4.1 Arithmetic Functions

- `abs()`: Absolute value
- `log()`, `log2()`, `log10()`: Logarithmic functions
- `cumsum()`: Cumulative sum
- `integral()`: Integral (area under the curve)
- `diff()`: Difference between consecutive points

### 4.2 Smoothing Functions

- `moving_average()`: Smooths data using moving average
- `ewma_3()`, `ewma_5()`, `ewma_10()`: Exponentially weighted moving averages
- `median_3()`, `median_5()`, `median_7()`: Median filters

### 4.3 Ranking and Selection Functions

- `top(query, n, 'method', 'direction')`: Selects top N timeseries
  - Example: `top(p99:trace.express.request{service:pf-accounts-frontend,env:prd} by {resource_name}, 5, 'max', 'desc')`
- `bottom()`: Selects bottom N timeseries
- `forecast()`: Predicts future values based on historical data

## 5. Best Practices

### 5.1 Query Optimization

- Be as specific as possible with tag filters to reduce processing time
- Limit the time range to only what's needed
- Use appropriate rollup intervals for your timeframe

### 5.2 Common Pitfalls

- Using `sum:` with percentage metrics can exceed 100%
- Forgetting to use `.as_count()` or `.as_rate()` with StatsD counters
- Applying incompatible functions to certain metric types

### 5.3 Examples of Common Queries

**CPU Usage Across All Production Hosts:**
```
avg:system.cpu.user{env:production}.rollup(avg, 60)
```

**Total HTTP Requests by Endpoint:**
```
sum:http.requests{*} by {endpoint}.as_count()
```

**95th Percentile of API Response Time:**
```
p95:api.response.time{*}.rollup(avg, 300)
```

**Top 5 Endpoints by Request Latency:**
```
top(p99:trace.express.request{service:frontend,env:prd} by {resource_name}, 5, 'max', 'desc')
```

**Sum of 5xx Errors from Load Balancer:**
```
sum:aws.applicationelb.httpcode_elb_5xx{aws_account:123456789,loadbalancer:app/production-elb/abc123}.as_count()
```

**Request Rate by Resource:**
```
sum:trace.express.request.hits{service:frontend,env:prd} by {resource_name}.as_rate()
```

## 6. Using Metrics with Datadog MCP Server

When implementing metrics retrieval in your code using the Datadog MCP Server, consider these parameters:

- `query`: The metrics query string (required)
- `from`/`to`: Time range in ISO 8601 format
- `granularity`: Optional data point interval

The server will return time series data that can be visualized or analyzed further.
