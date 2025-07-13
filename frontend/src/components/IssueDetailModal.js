import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Calendar, User, Phone, FileImage, Mic } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import apiService from '../services/api';

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFyc2hpbHBhdGVsLTIyIiwiYSI6ImNtYml6NXNobjA0aTMyaXM1bzl6d21zOHMifQ.CDVtrOMamRCtYrF-YEzbFw';


export const IssueDetailModal = ({ issueId, isOpen, onClose }) => {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssueDetails();
    }   
  }, [isOpen, issueId]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIssue(issueId);
      setIssue(data);
      setLoading(false);
      
      // Initialize map after issue data is loaded
      setTimeout(() => initializeMap(data), 100);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      setLoading(false);
    }
  };

  const initializeMap = (issueData) => {
    if (!mapContainer.current || !issueData.location) return;

    if (map.current) map.current.remove();

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [issueData.location.lng, issueData.location.lat],
      zoom: 16
    });

    // Add marker for issue location
    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([issueData.location.lng, issueData.location.lat])
      .addTo(map.current);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : issue ? (
            <>
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Issue #{issue.id}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {issue.category.en} / {issue.category.gu} / {issue.category.hi}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="mt-1 text-sm text-gray-900">{issue.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" /> Location
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">{issue.location.address}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" /> Reported
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(issue.timestamps.created).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 flex items-center">
                          <User className="w-4 h-4 mr-1" /> Reporter
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">{issue.phoneNumber}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>

                    {/* Map */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Exact Location</h4>
                      <div ref={mapContainer} className="w-full h-64 rounded-lg" />
                    </div>
                  </div>

                  {/* Right Column - Media */}
                  <div className="space-y-4">
                    {/* Images */}
                    {issue.files?.filter(f => f.type === 'image').length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                          <FileImage className="w-4 h-4 mr-1" /> Uploaded Images
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {issue.files
                            .filter(f => f.type === 'image')
                            .map((file, index) => (
                              <img
                                key={index}
                                src={`http://localhost:3000${file.url}`}
                                alt={`Issue ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                onClick={() => window.open(`http://localhost:3000${file.url}`, '_blank')}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Voice Notes */}
                    {issue.files?.filter(f => f.type === 'audio').length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 flex items-center mb-2">
                          <Mic className="w-4 h-4 mr-1" /> Voice Notes
                        </h4>
                        <div className="space-y-2">
                          {issue.files
                            .filter(f => f.type === 'audio')
                            .map((file, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <audio controls className="w-full">
                                  <source src={`http://localhost:3001${file.url}`} />
                                </audio>
                                {issue.voiceTranscripts?.[index] && (
                                  <p className="mt-2 text-sm text-gray-600">
                                    Transcript: {issue.voiceTranscripts[index]}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* RMC Response */}
                    {issue.rmcResponse && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">RMC Response</h4>
                        <p className="mt-1 text-sm text-gray-900">{issue.rmcResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {/* Handle assign */}}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Assign Team
                  </button>
                  <button
                    onClick={() => {/* Handle update status */}}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">Issue not found</div>
          )}
        </div>
      </div>
    </div>
  );
};