import React, { useState, useEffect } from 'react';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { interventionService } from '../../services/interventionService';
import { prospectService } from '../../services/prospectService';
import { formatDate, formatMontant, getStatutPaiement } from '../../utils/helpers';
import { Building, CreditCard, Settings, ChevronDown, ChevronUp, History, RefreshCw } from 'lucide-react';
import PaiementHistory from '../paiements/PaiementHistory';
import ProspectHistory from '../prospects/ProspectHistory';

/* ─── Win2000 palette ─── */
const W = {
  silver: '#D4D0C8',
  silverDark: '#A8A098',
  silverLight: '#FFFFFF',
  titleBar: 'linear-gradient(to right, #000080, #1084D0)',
  text: '#000000',
  textDisabled: '#808080',
  highlight: '#000080',
  highlightText: '#FFFFFF',
  btnFace: '#D4D0C8',
  btnShadow: '#808080',
  btnDkShadow: '#404040',
  btnHilight: '#FFFFFF',
};

const raisedBox = {
  background: W.silver,
  border: '2px solid',
  borderColor: `${W.btnHilight} ${W.btnDkShadow} ${W.btnDkShadow} ${W.btnHilight}`,
  boxShadow: `inset -1px -1px 0 ${W.btnShadow}, inset 1px 1px 0 ${W.silverLight}`,
};

const sunkenBox = {
  background: W.silverLight,
  border: '2px solid',
  borderColor: `${W.btnDkShadow} ${W.btnHilight} ${W.btnHilight} ${W.btnDkShadow}`,
  boxShadow: `inset 1px 1px 0 ${W.btnShadow}, inset -1px -1px 0 ${W.silverLight}`,
};

const TitleBar = ({ title, icon, active = true }) => (
  <div style={{
    background: active ? W.titleBar : 'linear-gradient(to right, #7A7A7A, #B0B0B0)',
    color: W.highlightText,
    fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    userSelect: 'none',
  }}>
    {icon && <span style={{ fontSize: '13px' }}>{icon}</span>}
    {title}
  </div>
);

const SectionPanel = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...raisedBox, marginBottom: '8px' }}>
      <div
        style={{
          background: W.silver,
          borderBottom: open ? `1px solid ${W.btnShadow}` : 'none',
          padding: '3px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
          fontSize: '11px',
          fontWeight: 'bold',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {icon} {title}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </div>
      {open && (
        <div style={{ padding: '8px', background: W.silver }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Win2kButton = ({ children, onClick, style }) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      style={{
        fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
        fontSize: '11px',
        padding: '2px 10px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        background: W.btnFace,
        color: W.text,
        border: '2px solid',
        borderColor: pressed
          ? `${W.btnDkShadow} ${W.btnHilight} ${W.btnHilight} ${W.btnDkShadow}`
          : `${W.btnHilight} ${W.btnDkShadow} ${W.btnDkShadow} ${W.btnHilight}`,
        boxShadow: pressed
          ? `inset 1px 1px 0 ${W.btnShadow}`
          : `inset -1px -1px 0 ${W.btnShadow}, inset 1px 1px 0 ${W.silverLight}`,
        ...style,
      }}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {children}
    </button>
  );
};

const DataRow = ({ label, value, highlight }) => (
  <tr>
    <td style={{
      padding: '2px 8px',
      fontSize: '11px',
      fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
      fontWeight: 'bold',
      background: W.silver,
      borderBottom: `1px solid ${W.silverDark}`,
      whiteSpace: 'nowrap',
      width: '40%',
    }}>{label}</td>
    <td style={{
      padding: '2px 8px',
      fontSize: '11px',
      fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
      background: highlight ? '#FFFFE0' : W.silverLight,
      borderBottom: `1px solid ${W.silverDark}`,
      color: highlight ? '#CC0000' : W.text,
      fontWeight: highlight ? 'bold' : 'normal',
    }}>{value || 'N/A'}</td>
  </tr>
);

const ClientDetails = ({ client }) => {
  const [installations, setInstallations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [renouvellements, setRenouvellements] = useState([]);
  const [resteTotal, setResteTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullPaiements, setShowFullPaiements] = useState(false);
  const [showProspectHistory, setShowProspectHistory] = useState(false);

  useEffect(() => { if (client) loadClientData(); }, [client]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const installData = await installationService.getByClient(client.id);
      const paiementData = await paiementService.getByClient(client.id);
      setInstallations(installData || []);
      setPaiements(paiementData || []);

      try {
        const historyData = await prospectService.getHistorique(client.id);
        const renouvellementsList = (historyData || [])
          .filter(action => action.action === 'abonnement_auto_renew')
          .map((action, idx) => {
            let applicationName = 'Application inconnue';
            if (action.description) {
              const match = action.description.match(/pour\s+(.+?)(?:\n|$)/);
              applicationName = match ? match[1].trim() : 'Application inconnue';
            }
            return { id: `renew-${action.id}-${idx}`, application: applicationName, date: action.date || action.created_at, montant: action.details?.montant, description: action.description };
          });
        setRenouvellements(renouvellementsList);
      } catch { setRenouvellements([]); }

      const totalInstallations = (installData || []).reduce((sum, i) => sum + (i.montant || 0), 0);
      const soldeInitial = client.solde_initial || 0;
      const totalDu = totalInstallations + soldeInitial;
      const totalPaye = (paiementData || []).reduce((sum, p) => sum + (p.montant || 0), 0);
      const resteAPayer = Math.max(0, totalDu - totalPaye);
      setResteTotal({ soldeInitial, totalInstallations, totalPaye, resteAPayer });

      try {
        const interventionData = await interventionService.getByClient(client.id);
        setInterventions(interventionData || []);
      } catch { setInterventions([]); }
    } catch {
      setInstallations([]); setPaiements([]); setInterventions([]); setRenouvellements([]);
      setResteTotal({ totalInstallations: 0, totalPaye: 0, resteAPayer: 0 });
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ ...raisedBox, padding: 0, fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif" }}>
        <TitleBar title={`Propriétés de : ${client?.raison_sociale || '...'}`} icon="👤" />
        <div style={{ padding: '30px', textAlign: 'center', fontSize: '12px' }}>
          <div style={{ marginBottom: '8px' }}>⏳ Chargement des propriétés...</div>
          <div style={{ ...sunkenBox, width: '200px', height: '16px', margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '40%', background: W.highlight, animation: 'win2k-progress 1.2s linear infinite' }} />
          </div>
        </div>
        <style>{`@keyframes win2k-progress { 0%{left:-40%} 100%{left:100%} }`}</style>
      </div>
    );
  }

  const totalPaiements = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);

  return (
    <div style={{ background: W.silver, fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif", fontSize: '12px', color: W.text }}>

      {/* ── Client Header Window ── */}
      <div style={{ ...raisedBox, marginBottom: '8px', padding: 0 }}>
        <TitleBar title={`Propriétés de : ${client.raison_sociale}`} icon="👤" />
        <div style={{ padding: '8px', background: W.silver }}>
          {/* Tab-like header bar */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
            {['Général', 'Finances', 'Historique'].map((tab, i) => (
              <div key={tab} style={{
                ...raisedBox,
                padding: '2px 12px',
                fontSize: '11px',
                fontWeight: i === 0 ? 'bold' : 'normal',
                background: i === 0 ? W.silverLight : W.silver,
                borderBottom: i === 0 ? 'none' : undefined,
                cursor: 'default',
                zIndex: i === 0 ? 1 : 0,
              }}>{tab}</div>
            ))}
          </div>
          {/* Client info table */}
          <div style={{ ...sunkenBox, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <DataRow label="Raison Sociale" value={client.raison_sociale} />
                <DataRow label="Contact" value={client.contact} />
                <DataRow label="Téléphone" value={client.telephone} />
                <DataRow label="Email" value={client.email} />
                <DataRow label="Secteur" value={client.secteur} />
                <DataRow label="Wilaya" value={client.wilaya} />
                {client.solde_initial > 0 && (
                  <DataRow label="Solde Initial" value={formatMontant(client.solde_initial)} highlight />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Financial Summary ── */}
      <div style={{ ...raisedBox, marginBottom: '8px', padding: 0 }}>
        <TitleBar title="Résumé Financier" icon="💰" />
        <div style={{ padding: '8px', background: W.silver, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { label: 'Solde Initial', value: formatMontant(client.solde_initial || 0), icon: '📋', color: '#CC6600' },
            { label: 'Installations', value: String(installations.length), icon: '🖥️', color: W.highlight },
            { label: 'Total Payé', value: formatMontant(totalPaiements), icon: '✅', color: '#008000' },
            { label: 'Reste Global', value: formatMontant(resteTotal?.resteAPayer || 0), icon: '⚠️', color: '#CC0000' },
          ].map(item => (
            <div key={item.label} style={{ ...raisedBox, flex: 1, minWidth: '120px', padding: 0 }}>
              <div style={{ background: W.silver, borderBottom: `1px solid ${W.btnShadow}`, padding: '2px 6px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {item.icon} {item.label}
              </div>
              <div style={{ ...sunkenBox, margin: '4px', padding: '4px 6px', fontSize: '16px', fontWeight: 'bold', color: item.color, textAlign: 'center' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Historique ── */}
      <SectionPanel title="Historique Complet du Client" icon="📜">
        <Win2kButton onClick={() => setShowProspectHistory(v => !v)}>
          {showProspectHistory ? <><ChevronUp size={12} /> Masquer</> : <><ChevronDown size={12} /> Voir l&apos;historique</>}
        </Win2kButton>
        {showProspectHistory ? (
          <div style={{ ...sunkenBox, marginTop: '6px', padding: '8px' }}>
            <ProspectHistory prospectId={client.id} />
          </div>
        ) : (
          <div style={{ marginTop: '6px', fontSize: '11px' }}>
            <p style={{ marginBottom: '4px' }}>ℹ️ Cet historique contient:</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Actions de suivi</li>
              <li>Conversion en client</li>
              <li>Installations</li>
              <li>Abonnements</li>
            </ul>
          </div>
        )}
      </SectionPanel>

      {/* ── Installations ── */}
      <SectionPanel title={`Installations (${installations.length})`} icon="🖥️">
        {installations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: W.textDisabled, fontSize: '11px' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🖥️</div>
            Aucune installation
          </div>
        ) : (
          <div style={{ ...sunkenBox, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: W.silver }}>
                  {['Application', 'Date Installation', 'Statut Paiement'].map(h => (
                    <th key={h} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', textAlign: 'left', borderBottom: `2px solid ${W.btnDkShadow}`, borderRight: `1px solid ${W.btnShadow}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {installations.map((inst, idx) => {
                  const totalPayeInst = paiements.filter(p => p.installation_id === inst.id).reduce((sum, p) => sum + (p.montant || 0), 0);
                  const statusPaiement = getStatutPaiement(inst.montant, totalPayeInst);
                  return (
                    <tr key={inst.id} style={{ background: idx % 2 === 0 ? W.silverLight : '#EAE8E0' }}>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{inst.application_installee}</td>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{formatDate(inst.date_installation)}</td>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}` }}>
                        <span style={{ background: statusPaiement.code === 2 ? '#008000' : statusPaiement.code === 1 ? '#CC6600' : '#CC0000', color: '#FFF', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold', border: `1px solid ${W.btnDkShadow}` }}>
                          {statusPaiement.code} {statusPaiement.icon}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      {/* ── Abonnements Renouvelés ── */}
      {renouvellements.length > 0 && (
        <SectionPanel title={`Abonnements Renouvelés (${renouvellements.length})`} icon="🔄">
          <div style={{ ...sunkenBox, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: W.silver }}>
                  {['Application', 'Date Renouvellement', 'Montant'].map(h => (
                    <th key={h} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', textAlign: 'left', borderBottom: `2px solid ${W.btnDkShadow}`, borderRight: `1px solid ${W.btnShadow}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renouvellements.map((renew, idx) => (
                  <tr key={renew.id} style={{ background: idx % 2 === 0 ? W.silverLight : '#EAE8E0' }}>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{renew.application}</td>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{formatDate(renew.date)}</td>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, fontWeight: 'bold', color: W.highlight }}>{renew.montant ? formatMontant(renew.montant) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
      )}

      {/* ── Historique Paiements ── */}
      <SectionPanel title={`Historique Paiements (${paiements.length})`} icon="💳">
        {paiements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '12px', color: W.textDisabled, fontSize: '11px' }}>Aucun paiement enregistré</div>
        ) : (
          <>
            <div style={{ ...sunkenBox, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: W.silver }}>
                    {['Application', 'Date', 'Mode', 'Montant'].map(h => (
                      <th key={h} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', textAlign: 'left', borderBottom: `2px solid ${W.btnDkShadow}`, borderRight: `1px solid ${W.btnShadow}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showFullPaiements ? paiements : paiements.slice(0, 5)).map((p, idx) => (
                    <tr key={p.id} style={{ background: idx % 2 === 0 ? W.silverLight : '#EAE8E0' }}>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{p.installation?.application_installee || 'Paiement'}</td>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{formatDate(p.date_paiement)}</td>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{p.mode_paiement || '—'}</td>
                      <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, fontWeight: 'bold', color: '#008000' }}>{formatMontant(p.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {paiements.length > 5 && (
              <div style={{ marginTop: '6px' }}>
                <Win2kButton onClick={() => setShowFullPaiements(v => !v)}>
                  {showFullPaiements ? '▲ Voir résumé' : `▼ Voir tout (${paiements.length})`}
                </Win2kButton>
              </div>
            )}
          </>
        )}
      </SectionPanel>

      {/* ── Interventions ── */}
      {interventions.length > 0 && (
        <SectionPanel title={`Interventions (${interventions.length})`} icon="🔧">
          <div style={{ ...sunkenBox, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: W.silver }}>
                  {['Type', 'Date', 'Technicien', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', textAlign: 'left', borderBottom: `2px solid ${W.btnDkShadow}`, borderRight: `1px solid ${W.btnShadow}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interventions.slice(0, 5).map((inter, idx) => (
                  <tr key={inter.id} style={{ background: idx % 2 === 0 ? W.silverLight : '#EAE8E0' }}>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}`, textTransform: 'capitalize' }}>{inter.type_intervention}</td>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{formatDate(inter.date_intervention)}</td>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>{inter.technicien?.nom || '—'}</td>
                    <td style={{ padding: '3px 8px', fontSize: '11px', borderBottom: `1px solid ${W.silverDark}` }}>
                      <span style={{ background: inter.statut === 'cloturee' ? '#008000' : '#CC6600', color: '#FFF', padding: '1px 6px', fontSize: '10px', fontWeight: 'bold', border: `1px solid ${W.btnDkShadow}` }}>
                        {inter.statut === 'cloturee' ? 'Clôturée' : 'En cours'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionPanel>
      )}

      {/* OK / Close buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', paddingTop: '6px' }}>
        <Win2kButton style={{ minWidth: '75px', justifyContent: 'center' }} onClick={() => {}}>OK</Win2kButton>
        <Win2kButton style={{ minWidth: '75px', justifyContent: 'center' }} onClick={() => {}}>Annuler</Win2kButton>
      </div>
    </div>
  );
};

export default ClientDetails;
