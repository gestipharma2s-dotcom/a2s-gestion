import React, { useState, useEffect } from 'react';
import { Eye, Archive, ArchiveRestore } from 'lucide-react';
import Modal from '../common/Modal';
import ClientDetails from './ClientDetails';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { supabase } from '../../services/supabaseClient';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatMontant } from '../../utils/helpers';

/* ─── Win2000 colour palette ─── */
const W = {
  desktop: '#008080',
  silver: '#D4D0C8',
  silverDark: '#A8A098',
  silverLight: '#FFFFFF',
  titleBar: 'linear-gradient(to right, #000080, #1084D0)',
  titleBarInactive: 'linear-gradient(to right, #7A7A7A, #B0B0B0)',
  text: '#000000',
  textDisabled: '#808080',
  highlight: '#000080',
  highlightText: '#FFFFFF',
  btnFace: '#D4D0C8',
  btnShadow: '#808080',
  btnDkShadow: '#404040',
  btnHilight: '#FFFFFF',
  scrollbar: '#C8C4BC',
};

/* ─── Shared Win2000 style helpers ─── */
const raisedBox = {
  background: W.silver,
  border: `2px solid`,
  borderColor: `${W.btnHilight} ${W.btnDkShadow} ${W.btnDkShadow} ${W.btnHilight}`,
  boxShadow: `inset -1px -1px 0 ${W.btnShadow}, inset 1px 1px 0 ${W.silverLight}`,
};

const sunkenBox = {
  background: W.silverLight,
  border: `2px solid`,
  borderColor: `${W.btnDkShadow} ${W.btnHilight} ${W.btnHilight} ${W.btnDkShadow}`,
  boxShadow: `inset 1px 1px 0 ${W.btnShadow}, inset -1px -1px 0 ${W.silverLight}`,
};

const Win2kButton = ({ children, onClick, disabled, active, style, title }) => {
  const [pressed, setPressed] = React.useState(false);
  const base = {
    fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
    fontSize: '11px',
    padding: '2px 8px',
    cursor: disabled ? 'default' : 'pointer',
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: W.btnFace,
    color: disabled ? W.textDisabled : W.text,
    border: '2px solid',
    borderColor: (pressed || active)
      ? `${W.btnDkShadow} ${W.btnHilight} ${W.btnHilight} ${W.btnDkShadow}`
      : `${W.btnHilight} ${W.btnDkShadow} ${W.btnDkShadow} ${W.btnHilight}`,
    boxShadow: (pressed || active)
      ? `inset 1px 1px 0 ${W.btnShadow}`
      : `inset -1px -1px 0 ${W.btnShadow}, inset 1px 1px 0 ${W.silverLight}`,
    ...style,
  };
  return (
    <button
      style={base}
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

const TitleBar = ({ title, icon, active = true }) => (
  <div style={{
    background: active ? W.titleBar : W.titleBarInactive,
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

const StatBox = ({ label, value, icon }) => (
  <div style={{
    ...raisedBox,
    padding: '8px 12px',
    fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
    minWidth: '120px',
    flex: 1,
  }}>
    <TitleBar title={label} icon={icon} />
    <div style={{
      ...sunkenBox,
      padding: '6px 10px',
      marginTop: '4px',
      fontSize: '22px',
      fontWeight: 'bold',
      color: W.highlight,
      textAlign: 'center',
    }}>
      {value}
    </div>
  </div>
);

const StatusBadge = ({ children, type }) => {
  const colors = {
    active: { bg: '#008000', text: '#FFFFFF' },
    archive: { bg: '#808080', text: '#FFFFFF' },
    paid: { bg: '#008000', text: '#FFFFFF' },
    partial: { bg: '#CC6600', text: '#FFFFFF' },
    none: { bg: '#CC0000', text: '#FFFFFF' },
  };
  const c = colors[type] || colors.archive;
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '1px 6px',
      border: `1px solid ${W.btnDkShadow}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('actif');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const { addNotification } = useApp();
  const { profile } = useAuth();

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { filterClients(); }, [clients, searchTerm, filterStatus]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await prospectService.getAll();
      const clientsListContext = data.filter(p => p.statut === 'actif' || p.statut === 'archive');
      const { data: allAbonnements } = await supabase.from('abonnements').select('*');

      const clientsWithFinancials = await Promise.all(
        clientsListContext.map(async (client) => {
          try {
            const installations = await installationService.getByClient(client.id);
            const paiements = await paiementService.getByClient(client.id);
            const totalInstallations = (installations || []).reduce((sum, i) => sum + (parseFloat(i.montant) || 0), 0);
            const soldeInitial = parseFloat(client.solde_initial) || 0;
            const clientAbonnements = (allAbonnements || []).filter(a =>
              installations.some(i => i.id === a.installation_id)
            );
            const totalAbonnements = clientAbonnements.reduce((sum, a) => {
              const inst = installations.find(i => i.id === a.installation_id);
              return sum + (parseFloat(inst?.montant_abonnement) || 0);
            }, 0);
            const totalDu = soldeInitial + totalInstallations + totalAbonnements;
            const totalPaye = (paiements || []).reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
            const resteAPayer = Math.max(0, totalDu - totalPaye);
            return { ...client, montant_paye: totalPaye, reste_a_payer: resteAPayer, montant_total: totalDu };
          } catch {
            return { ...client, montant_paye: 0, reste_a_payer: 0, montant_total: 0 };
          }
        })
      );
      setClients(clientsWithFinancials);
    } catch {
      addNotification({ type: 'error', message: 'Erreur lors du chargement des clients' });
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients.filter(c => c.statut === filterStatus);
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredClients(filtered);
  };

  const handleArchiveToggle = async (clientRow) => {
    const hasEditPermission = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!hasEditPermission) { addNotification({ type: 'error', message: 'Permission refusée' }); return; }
    const newStatus = clientRow.statut === 'archive' ? 'actif' : 'archive';
    const alertMsg = newStatus === 'archive'
      ? `Voulez-vous vraiment archiver le client "${clientRow.raison_sociale}" ?`
      : `Voulez-vous désarchiver le client "${clientRow.raison_sociale}" (retour aux clients actifs) ?`;
    if (!window.confirm(alertMsg)) return;
    try {
      await prospectService.update(clientRow.id, { statut: newStatus });
      addNotification({ type: 'success', message: `Client ${newStatus === 'archive' ? 'archivé' : 'désarchivé'} avec succès` });
      loadClients();
    } catch {
      addNotification({ type: 'error', message: "Erreur lors de la mise à jour de l'archivage." });
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const getPaymentType = (row) => {
    const montantTotal = row.montant_total || 0;
    const montantPaye = row.montant_paye || 0;
    const reste = Math.max(0, montantTotal - montantPaye);
    if (reste === montantTotal || montantTotal === 0) return { type: 'none', label: '0 (Aucun paiement)' };
    if (reste > 0) return { type: 'partial', label: '1 (Partiellement payé)' };
    return { type: 'paid', label: '2 (Totalement payé)' };
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  if (loading) {
    return (
      <div style={{
        ...raisedBox,
        padding: '40px',
        textAlign: 'center',
        fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
        fontSize: '12px',
        color: W.text,
      }}>
        <TitleBar title="Clients — GestiPharma 2S" icon="🖥️" />
        <div style={{ padding: '40px', color: W.text }}>
          <div style={{
            width: '200px',
            height: '16px',
            background: W.silver,
            border: `2px solid`,
            borderColor: `${W.btnDkShadow} ${W.btnHilight} ${W.btnHilight} ${W.btnDkShadow}`,
            margin: '0 auto 8px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '40%',
              background: W.highlight,
              animation: 'win2k-progress 1.2s linear infinite',
            }} />
          </div>
          <p>Chargement de la base de données...</p>
        </div>
        <style>{`@keyframes win2k-progress { 0%{left:-40%} 100%{left:100%} }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: W.silver,
      fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
      fontSize: '12px',
      color: W.text,
      minHeight: '100%',
      padding: '4px',
    }}>
      {/* ── Main Window ── */}
      <div style={{ ...raisedBox, padding: 0 }}>
        <TitleBar title="Clients — GestiPharma 2S" icon="👥" />

        {/* Toolbar */}
        <div style={{
          background: W.silver,
          borderBottom: `1px solid ${W.btnShadow}`,
          padding: '3px 4px',
          display: 'flex',
          gap: '2px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <Win2kButton onClick={() => setFilterStatus('actif')} active={filterStatus === 'actif'}>
            🟢 Clients Actifs
          </Win2kButton>
          <Win2kButton onClick={() => setFilterStatus('archive')} active={filterStatus === 'archive'}>
            📦 Boîte Archive
          </Win2kButton>
          <div style={{ width: '1px', height: '18px', background: W.btnShadow, margin: '0 2px' }} />
          <Win2kButton onClick={loadClients}>
            🔄 Actualiser
          </Win2kButton>
        </div>

        {/* Status & Stats Bar */}
        <div style={{
          padding: '6px 8px',
          background: W.silver,
          display: 'flex',
          gap: '8px',
          borderBottom: `1px solid ${W.btnShadow}`,
          flexWrap: 'wrap',
        }}>
          <StatBox label="Total Clients" value={clients.length} icon="👥" />
          <StatBox label="Affichés" value={filteredClients.length} icon="📋" />
          <StatBox label="Actifs" value={clients.filter(c => c.statut === 'actif').length} icon="🟢" />
          <StatBox label="Archivés" value={clients.filter(c => c.statut === 'archive').length} icon="📦" />
        </div>

        {/* Search */}
        <div style={{
          padding: '6px 8px',
          background: W.silver,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: `1px solid ${W.btnShadow}`,
        }}>
          <label style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>🔍 Rechercher:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Nom, contact, téléphone, email..."
            style={{
              ...sunkenBox,
              padding: '2px 6px',
              fontSize: '11px',
              fontFamily: "'Tahoma', 'MS Sans Serif', sans-serif",
              color: W.text,
              width: '300px',
              outline: 'none',
            }}
          />
          {searchTerm && (
            <Win2kButton onClick={() => setSearchTerm('')}>✖ Effacer</Win2kButton>
          )}
        </div>

        {/* Table */}
        <div style={{
          ...sunkenBox,
          margin: '6px 8px',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 320px)',
        }}>
          {filteredClients.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: W.textDisabled }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: W.silver }}>
                  {['Client', 'Date Création', 'Contact', 'Secteur', 'Reste à Payer', 'Statut Paiement', 'Wilaya', 'Statut', 'Actions'].map((h) => (
                    <th key={h} style={{
                      padding: '3px 8px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderBottom: `2px solid ${W.btnDkShadow}`,
                      borderRight: `1px solid ${W.btnShadow}`,
                      background: W.silver,
                      boxShadow: `inset -1px 0 0 ${W.btnHilight}`,
                      whiteSpace: 'nowrap',
                      cursor: 'default',
                      userSelect: 'none',
                      width: h === 'Actions' ? '130px' : h === 'Client' ? '160px' : undefined,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((row, idx) => {
                  const isSelected = selectedRow === row.id;
                  const payment = getPaymentType(row);
                  const rowBg = isSelected ? W.highlight : idx % 2 === 0 ? W.silverLight : '#EAE8E0';
                  const rowColor = isSelected ? W.highlightText : W.text;
                  return (
                    <tr
                      key={row.id || idx}
                      style={{ background: rowBg, color: rowColor, cursor: 'default' }}
                      onClick={() => setSelectedRow(row.id)}
                      onDoubleClick={() => handleViewDetails(row)}
                    >
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}`, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.raison_sociale}</div>
                        <div style={{ fontSize: '10px', color: isSelected ? '#A8C8FF' : W.textDisabled, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.email || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}`, fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {row.created_at?.includes('2025-12-31')
                          ? <span style={{ background: '#000080', color: '#FFFFFF', padding: '1px 4px', fontSize: '10px' }}>📦 ARCHIVE 2025</span>
                          : (row.created_at ? formatDate(row.created_at) : 'Sans date')
                        }
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>
                        <div style={{ fontSize: '11px' }}>{row.contact || 'N/A'}</div>
                        <div style={{ fontSize: '10px', color: isSelected ? '#A8C8FF' : W.textDisabled }}>{row.telephone || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}`, fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {row.secteur || 'N/A'}
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}`, fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', color: isSelected ? W.highlightText : (row.reste_a_payer > 0 ? '#CC0000' : '#008000') }}>
                        {isAdmin ? formatMontant(row.reste_a_payer || 0) : <span style={{ color: W.textDisabled }}>🔐</span>}
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>
                        <StatusBadge type={payment.type}>{payment.label}</StatusBadge>
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}`, fontSize: '11px' }}>
                        {row.wilaya || 'N/A'}
                      </td>
                      <td style={{ padding: '3px 8px', borderBottom: `1px solid ${W.silverDark}`, borderRight: `1px solid ${W.silverDark}` }}>
                        <StatusBadge type={row.statut === 'archive' ? 'archive' : 'active'}>
                          {row.statut === 'archive' ? 'ARCHIVE' : 'ACTIF'}
                        </StatusBadge>
                      </td>
                      <td style={{ padding: '3px 6px', borderBottom: `1px solid ${W.silverDark}` }}>
                        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                          <Win2kButton onClick={() => handleViewDetails(row)} title="Voir les détails">
                            <Eye size={12} /> Détails
                          </Win2kButton>
                          {isAdmin && (
                            <Win2kButton onClick={() => handleArchiveToggle(row)} title={row.statut === 'archive' ? 'Désarchiver' : 'Archiver'}>
                              {row.statut === 'archive' ? <><ArchiveRestore size={12} /> Restorer</> : <><Archive size={12} /> Archiver</>}
                            </Win2kButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Status Bar */}
        <div style={{
          borderTop: `1px solid ${W.btnShadow}`,
          padding: '2px 8px',
          display: 'flex',
          gap: '8px',
          background: W.silver,
        }}>
          <div style={{
            ...sunkenBox,
            padding: '1px 6px',
            fontSize: '11px',
            flex: 1,
          }}>
            {filteredClients.length} objet(s) — Filtre: {filterStatus === 'actif' ? 'Clients Actifs' : 'Boîte Archive'}
          </div>
          <div style={{
            ...sunkenBox,
            padding: '1px 6px',
            fontSize: '11px',
            width: '200px',
          }}>
            Double-clic pour ouvrir les détails
          </div>
        </div>
      </div>

      {/* Modal Détails Client */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails du Client"
        size="lg"
      >
        <ClientDetails client={selectedClient} />
      </Modal>
    </div>
  );
};

export default ClientsList;
