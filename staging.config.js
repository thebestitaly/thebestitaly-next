// Configurazione Database Staging per Traduzioni
module.exports = {
  staging: {
    database: 'railway',
    password: 'FowPRDivdnyNIQYEukgNUaSMSsrMKNBA',
    port: 5432,
    // Host da recuperare dal dashboard Railway
    host: 'HOST_TO_BE_REPLACED',
    
    // Connection string template
    getConnectionString: function(host) {
      return `postgresql://postgres:${this.password}@${host}:${this.port}/${this.database}`;
    }
  }
}; 