/**
 * OTLP TO HEC TRANSFORMER
 *
 * Converts OpenTelemetry Protocol (OTLP) data to Splunk HEC format.
 *
 * OTLP uses nested structures with resourceSpans/scopeSpans for traces
 * and resourceMetrics/scopeMetrics for metrics.
 *
 * HEC expects flat JSON events in this format:
 * {
 *   "time": epoch_timestamp,
 *   "event": { ...data... },
 *   "sourcetype": "otel:trace",
 *   "index": "main"
 * }
 */

/**
 * Transform OTLP traces to HEC events
 *
 * @param {object} otlpData - OTLP trace data with resourceSpans
 * @returns {array} Array of HEC event objects
 */
export function transformTracesToHEC(otlpData) {
  const hecEvents = [];

  if (!otlpData.resourceSpans) {
    return hecEvents;
  }

  otlpData.resourceSpans.forEach(resourceSpan => {
    const resourceAttrs = extractAttributes(resourceSpan.resource?.attributes || []);

    resourceSpan.scopeSpans?.forEach(scopeSpan => {
      const scopeName = scopeSpan.scope?.name || 'unknown';

      scopeSpan.spans?.forEach(span => {
        const spanAttrs = extractAttributes(span.attributes || []);

        // Convert nanoseconds to seconds for HEC time field
        const timeInSeconds = span.startTimeUnixNano
          ? parseFloat(span.startTimeUnixNano) / 1_000_000_000
          : Date.now() / 1000;

        hecEvents.push({
          time: timeInSeconds,
          event: {
            type: 'trace',
            traceId: span.traceId,
            spanId: span.spanId,
            parentSpanId: span.parentSpanId,
            name: span.name,
            kind: getSpanKind(span.kind),
            startTime: span.startTimeUnixNano,
            endTime: span.endTimeUnixNano,
            duration: calculateDuration(span.startTimeUnixNano, span.endTimeUnixNano),
            status: span.status,
            scope: scopeName,
            attributes: spanAttrs,
            resource: resourceAttrs
          },
          sourcetype: 'otel:trace',
          source: resourceAttrs['service.name'] || 'unknown',
          index: 'main'
        });
      });
    });
  });

  return hecEvents;
}

/**
 * Transform OTLP metrics to HEC events
 *
 * @param {object} otlpData - OTLP metric data with resourceMetrics
 * @returns {array} Array of HEC event objects
 */
export function transformMetricsToHEC(otlpData) {
  const hecEvents = [];

  if (!otlpData.resourceMetrics) {
    return hecEvents;
  }

  otlpData.resourceMetrics.forEach(resourceMetric => {
    const resourceAttrs = extractAttributes(resourceMetric.resource?.attributes || []);

    resourceMetric.scopeMetrics?.forEach(scopeMetric => {
      const scopeName = scopeMetric.scope?.name || 'unknown';

      scopeMetric.metrics?.forEach(metric => {
        const dataPoints = extractMetricDataPoints(metric);

        dataPoints.forEach(dataPoint => {
          const timeInSeconds = dataPoint.timeUnixNano
            ? parseFloat(dataPoint.timeUnixNano) / 1_000_000_000
            : Date.now() / 1000;

          hecEvents.push({
            time: timeInSeconds,
            event: {
              type: 'metric',
              name: metric.name,
              description: metric.description,
              unit: metric.unit,
              value: dataPoint.value,
              attributes: extractAttributes(dataPoint.attributes || []),
              scope: scopeName,
              resource: resourceAttrs
            },
            sourcetype: 'otel:metric',
            source: resourceAttrs['service.name'] || 'unknown',
            index: 'main'
          });
        });
      });
    });
  });

  return hecEvents;
}

/**
 * Transform OTLP logs to HEC events
 *
 * @param {object} otlpData - OTLP log data with resourceLogs
 * @returns {array} Array of HEC event objects
 */
export function transformLogsToHEC(otlpData) {
  const hecEvents = [];

  if (!otlpData.resourceLogs) {
    return hecEvents;
  }

  otlpData.resourceLogs.forEach(resourceLog => {
    const resourceAttrs = extractAttributes(resourceLog.resource?.attributes || []);

    resourceLog.scopeLogs?.forEach(scopeLog => {
      scopeLog.logRecords?.forEach(log => {
        const timeInSeconds = log.timeUnixNano
          ? parseFloat(log.timeUnixNano) / 1_000_000_000
          : Date.now() / 1000;

        hecEvents.push({
          time: timeInSeconds,
          event: {
            type: 'log',
            body: log.body?.stringValue || log.body,
            severityText: log.severityText,
            severityNumber: log.severityNumber,
            traceId: log.traceId,
            spanId: log.spanId,
            attributes: extractAttributes(log.attributes || []),
            resource: resourceAttrs
          },
          sourcetype: 'otel:log',
          source: resourceAttrs['service.name'] || 'unknown',
          index: 'main'
        });
      });
    });
  });

  return hecEvents;
}

/**
 * Extract attributes from OTLP attribute array to simple key-value object
 *
 * @param {array} attributes - OTLP attributes array
 * @returns {object} Flat key-value object
 */
function extractAttributes(attributes) {
  const result = {};

  attributes.forEach(attr => {
    const value = attr.value?.stringValue ||
                  attr.value?.intValue ||
                  attr.value?.doubleValue ||
                  attr.value?.boolValue ||
                  attr.value;
    result[attr.key] = value;
  });

  return result;
}

/**
 * Get human-readable span kind
 *
 * @param {number} kind - OTLP span kind enum
 * @returns {string} Span kind name
 */
function getSpanKind(kind) {
  const kinds = {
    0: 'UNSPECIFIED',
    1: 'INTERNAL',
    2: 'SERVER',
    3: 'CLIENT',
    4: 'PRODUCER',
    5: 'CONSUMER'
  };
  return kinds[kind] || 'UNKNOWN';
}

/**
 * Calculate duration from start and end timestamps
 *
 * @param {string} startNano - Start time in nanoseconds
 * @param {string} endNano - End time in nanoseconds
 * @returns {number} Duration in milliseconds
 */
function calculateDuration(startNano, endNano) {
  if (!startNano || !endNano) return 0;
  return (parseFloat(endNano) - parseFloat(startNano)) / 1_000_000; // Convert to milliseconds
}

/**
 * Extract data points from different metric types
 *
 * @param {object} metric - OTLP metric object
 * @returns {array} Array of data points
 */
function extractMetricDataPoints(metric) {
  if (metric.gauge) {
    return metric.gauge.dataPoints || [];
  } else if (metric.sum) {
    return metric.sum.dataPoints || [];
  } else if (metric.histogram) {
    return metric.histogram.dataPoints || [];
  } else if (metric.summary) {
    return metric.summary.dataPoints || [];
  }
  return [];
}
