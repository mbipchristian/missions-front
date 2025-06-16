import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, Download, Calendar, User, MapPin, DollarSign, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

// Types basés sur le modèle Java
interface OrdreMissionStatut {
  EN_ATTENTE_JUSTIFICATIF: 'EN_ATTENTE_JUSTIFICATIF';
  JUSTIFICATIF_SOUMIS: 'JUSTIFICATIF_SOUMIS';
  VALIDE: 'VALIDE';
  REJETE: 'REJETE';
  TERMINE: 'TERMINE';
}

interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  matricule: string;
  quotaAnnuel: number;
  role: {
    id: number;
    name: string;
    description: string;
  };
  fonction: string;
  created_at: string;
  updated_at: string;
}

interface MandatResponseDto {
  id: number;
  reference: string;
  objectif: string;
  dateDebut: string;
  dateFin: string;
  duree: number;
  statut: string;
}

interface OrdreMissionResponseDto {
  id: number;
  reference: string;
  objectif: string;
  modePaiement: string;
  devise: string;
  tauxAvance: number;
  dateDebut: string;
  dateFin: string;
  duree: number;
  decompteTotal: number;
  decompteAvance: number;
  decompteRelicat: number;
  statut: keyof OrdreMissionStatut;
  user: UserResponseDto;
  mandat: MandatResponseDto;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

const OrdreMissionPage: React.FC = () => {
  const [ordresMission, setOrdresMission] = useState<OrdreMissionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatut, setSelectedStatut] = useState<string>('TOUS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrdreMission, setSelectedOrdreMission] = useState<OrdreMissionResponseDto | null>(null);

  // Simulation d'appel API
  useEffect(() => {
    fetchOrdresMission();
  }, []);

  const fetchOrdresMission = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/auth/ordres-mission', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des ordres de mission');
      }

      const data: ApiResponse<OrdreMissionResponseDto[]> = await response.json();
      setOrdresMission(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE_JUSTIFICATIF':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'JUSTIFICATIF_SOUMIS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VALIDE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJETE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TERMINE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJETE':
        return <XCircle className="w-4 h-4" />;
      case 'EN_ATTENTE_JUSTIFICATIF':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredOrdresMission = ordresMission.filter(ordre => {
    const matchesStatut = selectedStatut === 'TOUS' || ordre.statut === selectedStatut;
    const matchesSearch = 
      ordre.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordre.objectif.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatut && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Chargement des ordres de mission...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrdresMission}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ordres de Mission</h1>
          <p className="text-gray-600">Gestion et suivi des ordres de mission générés</p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Référence, utilisateur, objectif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="EN_ATTENTE_JUSTIFICATIF">En attente justificatif</option>
                <option value="JUSTIFICATIF_SOUMIS">Justificatif soumis</option>
                <option value="VALIDE">Validé</option>
                <option value="REJETE">Rejeté</option>
                <option value="TERMINE">Terminé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total des ordres</h3>
                <p className="text-2xl font-bold text-gray-900">{ordresMission.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">En attente</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {ordresMission.filter(o => o.statut === 'EN_ATTENTE_JUSTIFICATIF').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Validés</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {ordresMission.filter(o => o.statut === 'VALIDE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Montant total</h3>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(ordresMission.reduce((sum, o) => sum + o.decompteTotal, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des ordres de mission */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ordres de Mission ({filteredOrdresMission.length})
            </h2>
          </div>

          {filteredOrdresMission.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun ordre de mission trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrdresMission.map((ordre) => (
                    <tr key={ordre.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ordre.reference}
                          </div>
                          <div className="text-sm text-gray-500">
                            Mandat: {ordre.mandat.reference}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {ordre.user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ordre.user.matricule}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(ordre.dateDebut)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ordre.duree} jour{ordre.duree > 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {formatCurrency(ordre.decompteTotal)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Avance: {formatCurrency(ordre.decompteAvance)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatutColor(ordre.statut)}`}>
                          {getStatutIcon(ordre.statut)}
                          <span className="ml-1">
                            {ordre.statut.replace(/_/g, ' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrdreMission(ordre)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </button>
                          <button className="text-green-600 hover:text-green-900 flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de détails */}
        {selectedOrdreMission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Détails de l'Ordre de Mission
                  </h3>
                  <button
                    onClick={() => setSelectedOrdreMission(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Référence</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrdreMission.reference}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Statut</label>
                      <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatutColor(selectedOrdreMission.statut)}`}>
                        {getStatutIcon(selectedOrdreMission.statut)}
                        <span className="ml-1">
                          {selectedOrdreMission.statut.replace(/_/g, ' ')}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Objectif</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrdreMission.objectif}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date de début</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOrdreMission.dateDebut)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date de fin</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOrdreMission.dateFin)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Informations financières</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Montant total</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {formatCurrency(selectedOrdreMission.decompteTotal)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Taux d'avance</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrdreMission.tauxAvance}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Avance</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(selectedOrdreMission.decompteAvance)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Reliquat</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(selectedOrdreMission.decompteRelicat)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setSelectedOrdreMission(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Télécharger PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdreMissionPage;