module.exports = {
    backend: {
      url: process.env.RPRO_BACKEND_BACKEND_URL,
    },
    monolith: {
      url: process.env.RPRO_BACKEND_MONOLITH_URL || 'http://localhost:3030',
    },
    kafka: {
      brokers: (process.env.RPRO_BACKEND_KAFKA_BROKERS || 'kafka:9092').toString().split(',')
    },
    authService: {
      url: process.env.RPRO_BACKEND_AUTH_SERVICE_URL || 'http://localhost:3040',
    },
    stationService: {
      url: process.env.RPRO_BACKEND_STATION_SERVICE_URL || 'http://localhost:3032',
    },
};
  