// Configurazione Dual Database per Traduzioni
export interface DatabaseConfig {
  production: {
    url: string;
    directus: {
      url: string;
      token: string;
    };
  };
  staging: {
    url: string;
    directus: {
      url: string;
      token: string;
    };
  };
}

export const databaseConfig: DatabaseConfig = {
  production: {
    url: process.env.DATABASE_URL!,
    directus: {
      url: process.env.DIRECTUS_URL!,
      token: process.env.DIRECTUS_TOKEN!,
    },
  },
  staging: {
    // Configurazione database staging per traduzioni
    url: process.env.STAGING_DATABASE_URL || 'postgresql://postgres:FowPRDivdnyNIQYEukgNUaSMSsrMKNBA@HOST:5432/railway',
    directus: {
      url: process.env.STAGING_DIRECTUS_URL || process.env.DIRECTUS_URL!,
      token: process.env.STAGING_DIRECTUS_TOKEN || process.env.DIRECTUS_TOKEN!,
    },
  },
};

// Utility per switchare tra database
export const getDbConfig = (useStaging: boolean = false) => {
  return useStaging ? databaseConfig.staging : databaseConfig.production;
};

// Verifica se il sistema staging è configurato
export const isStagingConfigured = () => {
  return process.env.STAGING_DATABASE_URL && 
         process.env.STAGING_DATABASE_URL !== 'postgresql://postgres:FowPRDivdnyNIQYEukgNUaSMSsrMKNBA@HOST:5432/railway';
};

// Stati delle traduzioni
export enum TranslationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  CONFIRMED = 'confirmed',
  ERROR = 'error'
}

export interface TranslationJob {
  id: string;
  type: 'article' | 'company' | 'destination';
  itemId: string;
  targetLanguages: string[];
  status: TranslationStatus;
  createdAt: Date;
  completedAt?: Date;
  confirmedAt?: Date;
  error?: string;
} 