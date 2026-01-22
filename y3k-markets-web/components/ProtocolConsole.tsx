// Protocol Console - Universal Web3 Object Interface
// Implements: PROTOCOL_CONSOLE_STANDARD.md v1.0.0

import { QRCodeSVG } from 'qrcode.react';

export interface ObjectSchema {
  object_type: 'namespace' | 'chain' | 'vault' | 'agent' | 'infrastructure';
  canonical_id: string;
  display_name: string;
  description: string;
  
  authority: {
    entity: string;
    context: string;
    verification: 'verified' | 'unverified' | 'contested';
    verification_method?: string;
  };
  
  qr: {
    protocol: string;
    payload: string;
    fallback_url: string;
    encoding: 'protocol-native' | 'descriptor' | 'resolver';
    size?: 'small' | 'medium' | 'large';
  };
  
  actions: Action[];
  state: StateBlock[];
  metadata?: Record<string, any>;
  theme?: {
    primary_color?: string;
    accent_color?: string;
    badge_icon?: string;
  };
}

export interface Action {
  id: string;
  label: string;
  enabled: boolean;
  disabled_reason?: string;
  endpoint?: string;
  requires_auth?: boolean;
}

export interface StateBlock {
  label: string;
  value: string | number;
  unit?: string;
  format?: 'currency' | 'percentage' | 'number' | 'date';
  color?: string;
}

interface ProtocolConsoleProps {
  object: ObjectSchema;
  onAction?: (actionId: string) => void;
}

export function ProtocolConsole({ object, onAction }: ProtocolConsoleProps) {
  const handleAction = (action: Action) => {
    if (!action.enabled) return;
    
    if (onAction) {
      onAction(action.id);
    } else if (action.endpoint) {
      window.location.href = action.endpoint;
    }
  };

  const formatValue = (stat: StateBlock): string => {
    const { value, unit, format } = stat;
    
    if (format === 'currency') {
      return `$${Number(value).toLocaleString()}`;
    }
    if (format === 'percentage') {
      return `${value}%`;
    }
    if (format === 'number') {
      return Number(value).toLocaleString();
    }
    if (format === 'date') {
      return String(value);
    }
    
    return unit ? `${value} ${unit}` : String(value);
  };

  const qrSize = object.qr.size === 'small' ? 160 : 
                 object.qr.size === 'medium' ? 200 : 256;

  return (
    <div className="protocol-console">
      {/* 1. Identity Header */}
      <header className="console-identity">
        <div className="identity-badge">
          {object.theme?.badge_icon && (
            <span className="badge-icon">{object.theme.badge_icon}</span>
          )}
        </div>
        <h1 className="canonical-id" style={{ 
          color: object.theme?.primary_color 
        }}>
          {object.canonical_id}
        </h1>
        <p className="type-description">{object.description}</p>
        
        {object.authority.verification === 'verified' && (
          <div className="authority-badge">
            <span className="verify-icon">✓</span>
            <span className="authority-text">
              Verified by {object.authority.entity}
            </span>
          </div>
        )}
        
        {object.authority.verification === 'contested' && (
          <div className="authority-badge contested">
            <span className="verify-icon">⚠</span>
            <span className="authority-text">Verification Contested</span>
          </div>
        )}
      </header>

      {/* 2. QR Primary Interface */}
      <div className="console-qr">
        <div className="qr-container">
          <QRCodeSVG 
            value={object.qr.payload}
            size={qrSize}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="qr-instruction">Scan to interact</p>
        <p className="qr-fallback">
          Fallback: <a href={object.qr.fallback_url} target="_blank" rel="noopener noreferrer">
            {object.qr.fallback_url.replace(/^https?:\/\//, '')}
          </a>
        </p>
      </div>

      {/* 3. Deterministic Actions */}
      <div className="console-actions">
        {object.actions.map(action => (
          <button
            key={action.id}
            className={`console-action ${!action.enabled ? 'disabled' : ''}`}
            disabled={!action.enabled}
            title={action.disabled_reason}
            onClick={() => handleAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* 4. State Blocks */}
      <div className="console-state">
        {object.state.map((stat, i) => (
          <div key={i} className="state-block">
            <span className="state-label">{stat.label}</span>
            <span 
              className="state-value"
              style={{ color: stat.color }}
            >
              {formatValue(stat)}
            </span>
          </div>
        ))}
      </div>

      {/* Version Stamp */}
      <div className="console-footer">
        <span className="protocol-version">
          Protocol Console v1.0.0
        </span>
      </div>
    </div>
  );
}
