import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Star, 
  Navigation, 
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Heart,
  Brain,
  Activity,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Send,
  AlertTriangle,
  Mail
} from 'lucide-react'
import { hospitalConnectorAPI, patientsAPI } from '../services/api'

const HospitalConnector = () => {
  const { patientId } = useParams()
  const [searchParams] = useSearchParams()
  const [patient, setPatient] = useState(null)
  const [hospitals, setHospitals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('distance') // distance, rating, name
  const [locationStatus, setLocationStatus] = useState('') // 'loading', 'found', 'error'
  const [sendingProfile, setSendingProfile] = useState(false)
  const [sendStatus, setSendStatus] = useState(null) // { type: 'success'|'error', message: string }

  useEffect(() => {
    if (patientId) {
      fetchPatient()
    }
  }, [patientId])

  useEffect(() => {
    if (patientId && patient) {
      fetchHospitals()
    }
  }, [patientId, searchParams, patient])

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getById(parseInt(patientId))
      setPatient(response.data)
    } catch (error) {
      console.error('Error fetching patient:', error)
    }
  }

  // Geocode patient address to get coordinates
  const geocodeAddress = async (address, city, state, country) => {
    try {
      // Try browser geolocation first
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
            },
            async () => {
              // If geolocation fails, use Nominatim geocoding
              const geocoded = await geocodeWithNominatim(address, city, state, country)
              resolve(geocoded)
            },
            { timeout: 5000 }
          )
        })
      } else {
        // Use Nominatim geocoding
        return await geocodeWithNominatim(address, city, state, country)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  // Geocode using Nominatim (OpenStreetMap's free geocoding service)
  const geocodeWithNominatim = async (address, city, state, country) => {
    try {
      const queryParts = []
      if (address) queryParts.push(address)
      if (city) queryParts.push(city)
      if (state) queryParts.push(state)
      if (country) queryParts.push(country)
      
      const query = queryParts.join(', ')
      if (!query) return null

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'InnovAItion-Medical-App'
          }
        }
      )
      
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error('Nominatim geocoding error:', error)
      return null
    }
  }

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      setError(null)
      const analysisType = searchParams.get('analysisType') || 'General Analysis'
      
      // First, get patient data and geocode their location
      let patientLocation = null
      if (patient) {
        patientLocation = await geocodeAddress(
          patient.address,
          patient.city,
          patient.state,
          patient.country
        )
      }

      // If we have patient location, use it; otherwise use default
      if (patientLocation) {
        setMapCenter(patientLocation)
      }

      // Pass patient location coordinates to backend
      const response = await hospitalConnectorAPI.findNearest(
        parseInt(patientId), 
        analysisType,
        patientLocation?.lat,
        patientLocation?.lng
      )
      setHospitals(response.data)
      
      // Update map center with patient coordinates from backend or geocoded location
      if (patientLocation) {
        setMapCenter(patientLocation)
      } else if (response.data.patientCoordinates) {
        setMapCenter({
          lat: response.data.patientCoordinates.latitude,
          lng: response.data.patientCoordinates.longitude
        })
      } else if (response.data.hospitals && response.data.hospitals.length > 0) {
        setMapCenter({
          lat: response.data.hospitals[0].latitude,
          lng: response.data.hospitals[0].longitude
        })
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setError('Failed to load hospital information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort hospitals
  const filteredHospitals = useMemo(() => {
    if (!hospitals?.hospitals) return []
    
    let filtered = hospitals.hospitals.filter(hospital => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        hospital.name?.toLowerCase().includes(query) ||
        hospital.address?.toLowerCase().includes(query) ||
        hospital.specialty?.toLowerCase().includes(query) ||
        hospital.services?.toLowerCase().includes(query)
      )
    })

    // Sort hospitals
    filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance || 0) - (b.distance || 0)
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0)
      } else {
        return (a.name || '').localeCompare(b.name || '')
      }
    })

    return filtered
  }, [hospitals?.hospitals, searchQuery, sortBy])

  const openInMaps = (hospital) => {
    // Open in OpenStreetMap
    const url = `https://www.openstreetmap.org/?mlat=${hospital.latitude}&mlon=${hospital.longitude}&zoom=15`
    window.open(url, '_blank')
  }

  const getDirections = (hospital) => {
    // Use OpenRouteService or fallback to Google Maps for directions
    // OpenRouteService is free but requires API key for production
    // For now, use Google Maps as fallback (still works without API key for directions)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`
    window.open(url, '_blank')
  }

  const handleSendProfile = async (hospital, isEmergency = false) => {
    if (!hospital.email) {
      alert('Hospital email not available')
      return
    }

    if (!window.confirm(
      isEmergency 
        ? `🚨 EMERGENCY REQUEST: Send patient profile to ${hospital.name}?\n\nThis will send all patient data and latest analysis with HIGH PRIORITY.`
        : `Send patient profile to ${hospital.name}?\n\nThis will include patient information and latest AI analysis.`
    )) {
      return
    }

    try {
      setSendingProfile(true)
      setSendStatus(null)
      const response = await hospitalConnectorAPI.sendProfile(
        parseInt(patientId),
        hospital.email,
        isEmergency
      )
      
      if (response.data.success) {
        setSendStatus({ type: 'success', message: response.data.message })
        setTimeout(() => setSendStatus(null), 5000)
      } else {
        setSendStatus({ type: 'error', message: response.data.message || 'Failed to send profile' })
        setTimeout(() => setSendStatus(null), 5000)
      }
    } catch (error) {
      console.error('Error sending profile:', error)
      setSendStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send profile. Please try again.' 
      })
      setTimeout(() => setSendStatus(null), 5000)
    } finally {
      setSendingProfile(false)
    }
  }

  const getSpecialtyIcon = (specialty) => {
    if (!specialty) return <Building2 size={20} />
    const spec = specialty.toLowerCase()
    if (spec.includes('cardio') || spec.includes('heart')) return <Heart size={20} />
    if (spec.includes('neuro') || spec.includes('brain')) return <Brain size={20} />
    return <Activity size={20} />
  }

  const getSpecialtyColor = (specialty) => {
    if (!specialty) return '#3b82f6'
    const spec = specialty.toLowerCase()
    if (spec.includes('cardio') || spec.includes('heart')) return '#ef4444'
    if (spec.includes('neuro') || spec.includes('brain')) return '#8b5cf6'
    if (spec.includes('cancer') || spec.includes('oncology')) return '#ec4899'
    return '#3b82f6'
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!hospitals?.hospitals || hospitals.hospitals.length === 0) {
      return
    }

    let mapInstance = null
    let checkInterval = null

    function initializeMap() {
      if (typeof window === 'undefined' || !window.L) {
        // Wait for Leaflet to load
        checkInterval = setInterval(() => {
          if (window.L) {
            clearInterval(checkInterval)
            createMap()
          }
        }, 100)
        return
      }
      createMap()
    }

    function createMap() {
      if (!window.L) {
        console.log('Leaflet not loaded yet')
        return
      }
      
      if (!hospitals?.hospitals || hospitals.hospitals.length === 0) {
        console.log('No hospitals data available')
        return
      }

      const mapContainer = document.getElementById('hospital-map')
      if (!mapContainer) {
        console.log('Map container not found, retrying...')
        // Retry after a short delay if container not ready
        setTimeout(createMap, 200)
        return
      }

      console.log('Initializing map with', hospitals.hospitals.length, 'hospitals')

      // Clean up existing map
      if (mapContainer._leafletMap) {
        try {
          mapContainer._leafletMap.remove()
        } catch (e) {
          console.error('Error removing map:', e)
        }
        mapContainer._leafletMap = null
      }
      mapContainer.innerHTML = ''

      try {
        // Create new map
        const map = window.L.map('hospital-map', {
          zoomControl: true,
          attributionControl: true
        }).setView([mapCenter.lat, mapCenter.lng], 12)
        
        mapInstance = map
        mapContainer._leafletMap = map

        // Add OpenStreetMap tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map)

        // Add patient location marker
        const patientIcon = window.L.divIcon({
          className: 'patient-marker',
          html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
        window.L.marker([mapCenter.lat, mapCenter.lng], { icon: patientIcon })
          .addTo(map)
          .bindPopup('<strong>📍 Patient Location</strong>')

        // Add hospital markers
        const markers = []
        console.log('Adding markers for hospitals:', hospitals.hospitals.map(h => h.name))
        hospitals.hospitals.forEach((hospital, index) => {
          if (!hospital.latitude || !hospital.longitude) {
            console.warn('Hospital missing coordinates:', hospital.name, hospital)
            return
          }
          
          console.log(`Adding marker for ${hospital.name} at (${hospital.latitude}, ${hospital.longitude})`)

          const isSelected = selectedHospital === index
          const specialtyColor = getSpecialtyColor(hospital.specialty)
          
          const hospitalIcon = window.L.divIcon({
            className: 'hospital-marker',
            html: `<div style="width: ${isSelected ? '32px' : '24px'}; height: ${isSelected ? '32px' : '24px'}; background: ${specialtyColor}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: ${isSelected ? '16px' : '12px'}; font-weight: bold;">🏥</span>
            </div>`,
            iconSize: isSelected ? [32, 32] : [24, 24],
            iconAnchor: isSelected ? [16, 16] : [12, 12]
          })

          const marker = window.L.marker([hospital.latitude, hospital.longitude], { icon: hospitalIcon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <strong style="color: ${specialtyColor};">${hospital.name}</strong><br/>
                <small>${hospital.specialty || 'General'}</small><br/>
                <small>${hospital.distance?.toFixed(1) || 'N/A'} km away</small>
              </div>
            `)

          markers.push(marker)

          // Highlight selected hospital
          if (isSelected) {
            marker.openPopup()
            map.setView([hospital.latitude, hospital.longitude], 14)
          }
        })

        // Invalidate map size to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize()
          console.log('Map initialized with', markers.length, 'hospital markers')
          
          // Fit map to show all markers after a short delay to ensure markers are rendered
          if (markers.length > 0) {
            const bounds = window.L.latLngBounds(
              markers.map(m => m.getLatLng()).concat([[mapCenter.lat, mapCenter.lng]])
            )
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
            console.log('Map bounds set to show all markers')
          } else {
            console.warn('No markers to display on map')
          }
        }, 500)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    // Initialize with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeMap()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (checkInterval) {
        clearInterval(checkInterval)
      }
      const mapContainer = document.getElementById('hospital-map')
      if (mapContainer && mapContainer._leafletMap) {
        try {
          mapContainer._leafletMap.remove()
        } catch (e) {
          console.error('Error cleaning up map:', e)
        }
        mapContainer._leafletMap = null
      }
    }
  }, [hospitals, mapCenter, selectedHospital])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Finding nearest hospitals...
        </p>
      </div>
    )
  }

  if (error || !hospitals) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <Link 
          to={`/patients/${patientId}`} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            marginBottom: '1rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          Back to Patient
        </Link>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#ef4444', fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            {error || 'Hospital information not available'}
          </p>
          <button
            onClick={fetchHospitals}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Back Button */}
      <Link 
        to={`/patients/${patientId}`} 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} />
        Back to Patient
      </Link>

      {/* Hero Header */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: '20px',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <MapPin size={40} color="white" />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.5rem', 
            fontWeight: '800',
            marginBottom: '0.5rem'
          }}>
            Find Hospitals & Specialists
          </h1>
          <p style={{ 
            margin: 0, 
            opacity: 0.95, 
            fontSize: '1.125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <User size={18} />
            {patient?.firstName} {patient?.lastName}
            {hospitals?.requiredSpecialty && (
              <>
                <span>•</span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {hospitals.requiredSpecialty} Specialists
                </span>
              </>
            )}
          </p>
          {patient && (patient.address || patient.city) && (
            <p style={{ 
              margin: '0.5rem 0 0 0', 
              opacity: 0.85, 
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <MapPin size={14} />
              {[patient.address, patient.city, patient.state, patient.country].filter(Boolean).join(', ') || 'Location being detected...'}
            </p>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }}
          />
          <input
            type="text"
            placeholder="Search hospitals by name, address, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          />
        </div>
        <button
          onClick={async () => {
            setLocationStatus('loading')
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newCenter = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  }
                  setMapCenter(newCenter)
                  setLocationStatus('found')
                  setTimeout(() => setLocationStatus(''), 3000)
                },
                () => {
                  setLocationStatus('error')
                  setTimeout(() => setLocationStatus(''), 3000)
                }
              )
            } else {
              setLocationStatus('error')
              setTimeout(() => setLocationStatus(''), 3000)
            }
          }}
          style={{
            padding: '0.875rem 1.25rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <MapPin size={18} />
          {locationStatus === 'loading' ? 'Locating...' : locationStatus === 'found' ? 'Found!' : 'Use Current Location'}
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.875rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="distance">Sort by Distance</option>
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Map and Hospitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Map Container */}
        <div className="card" style={{ 
          padding: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          overflow: 'hidden',
          height: '600px',
          position: 'relative'
        }}>
          <div 
            id="hospital-map" 
            style={{ 
              width: '100%', 
              height: '100%',
              minHeight: '600px',
              borderRadius: '16px',
              zIndex: 1
            }}
          />
          {(!hospitals?.hospitals || hospitals.hospitals.length === 0) && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              zIndex: 0
            }}>
              <MapPin size={48} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Loading map...</p>
            </div>
          )}
        </div>

        {/* Hospitals List */}
        <div style={{ 
          maxHeight: '600px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {filteredHospitals.length > 0 && sortBy === 'distance' && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #10b98115, #05966915)',
              border: '1px solid #10b98130',
              borderRadius: '12px',
              fontSize: '0.875rem',
              color: '#10b981',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <MapPin size={16} />
              Showing {filteredHospitals.length} nearest hospitals sorted by distance
            </div>
          )}
          {filteredHospitals.length === 0 ? (
            <div className="card" style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Search size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', fontWeight: '600' }}>
                No hospitals found
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            filteredHospitals.map((hospital, index) => {
              const specialtyColor = getSpecialtyColor(hospital.specialty)
              const isSelected = selectedHospital === index
              const isNearest = index === 0 && sortBy === 'distance'
              
              return (
                <div 
                  key={hospital.id || index}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    background: isSelected 
                      ? `linear-gradient(135deg, ${specialtyColor}10, ${specialtyColor}05)` 
                      : isNearest
                      ? `linear-gradient(135deg, #10b98110, #10b98105)`
                      : 'var(--bg-card)',
                    border: isSelected 
                      ? `2px solid ${specialtyColor}` 
                      : isNearest
                      ? `2px solid #10b981`
                      : '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                    boxShadow: isSelected 
                      ? `0 8px 24px ${specialtyColor}20` 
                      : isNearest
                      ? `0 4px 16px #10b98120`
                      : '0 2px 8px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                  onClick={() => {
                    setSelectedHospital(isSelected ? null : index)
                    setMapCenter({ lat: hospital.latitude, lng: hospital.longitude })
                  }}
                >
                  {isNearest && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.375rem 0.75rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}>
                      <MapPin size={12} />
                      NEAREST
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {/* Hospital Icon */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, ${specialtyColor}, ${specialtyColor}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 4px 12px ${specialtyColor}30`
                    }}>
                      {getSpecialtyIcon(hospital.specialty)}
                    </div>

                    {/* Hospital Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        justifyContent: 'space-between', 
                        marginBottom: '0.5rem',
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '1.125rem', 
                            fontWeight: '700', 
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem'
                          }}>
                            {hospital.name}
                          </h3>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginTop: '0.25rem'
                          }}>
                            {hospital.rating && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                color: '#fbbf24'
                              }}>
                                <Star size={14} fill="#fbbf24" />
                                <span style={{ 
                                  fontSize: '0.875rem', 
                                  fontWeight: '600',
                                  color: 'var(--text-primary)'
                                }}>
                                  {hospital.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {hospital.specialty && (
                              <>
                                <span style={{ color: 'var(--text-secondary)' }}>•</span>
                                <span style={{ 
                                  fontSize: '0.875rem',
                                  color: specialtyColor,
                                  fontWeight: '600'
                                }}>
                                  {hospital.specialty}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{
                          padding: '0.5rem 1rem',
                          background: `${specialtyColor}15`,
                          color: specialtyColor,
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          whiteSpace: 'nowrap'
                        }}>
                          {hospital.distance?.toFixed(1) || 'N/A'} km
                        </div>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                      }}>
                        <MapPin size={16} />
                        <span style={{ flex: 1 }}>{hospital.address || 'Address not available'}</span>
                      </div>

                      {hospital.email && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.875rem'
                        }}>
                          <Mail size={16} />
                          <span style={{ flex: 1 }}>{hospital.email}</span>
                        </div>
                      )}

                      {hospital.services && (
                        <div style={{ 
                          marginTop: '0.75rem',
                          padding: '0.75rem',
                          background: 'var(--bg)',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Services:</strong> {hospital.services}
                        </div>
                      )}

                      {isSelected && (
                        <div style={{ 
                          marginTop: '1rem', 
                          paddingTop: '1rem',
                          borderTop: `1px solid ${specialtyColor}30`,
                          animation: 'fadeIn 0.3s ease'
                        }}>
                          {/* Status Message */}
                          {sendStatus && (
                            <div style={{
                              padding: '0.75rem 1rem',
                              marginBottom: '1rem',
                              borderRadius: '10px',
                              background: sendStatus.type === 'success' 
                                ? 'linear-gradient(135deg, #10b98115, #05966915)'
                                : 'linear-gradient(135deg, #ef444415, #dc262615)',
                              border: `1px solid ${sendStatus.type === 'success' ? '#10b981' : '#ef4444'}`,
                              color: sendStatus.type === 'success' ? '#10b981' : '#ef4444',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {sendStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                              {sendStatus.message}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ 
                            display: 'flex',
                            gap: '0.75rem',
                            flexWrap: 'wrap'
                          }}>
                            {hospital.phone && (
                              <a
                                href={`tel:${hospital.phone}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.75rem 1.5rem',
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: 'white',
                                  borderRadius: '10px',
                                  textDecoration: 'none',
                                  fontWeight: '600',
                                  fontSize: '0.875rem',
                                  transition: 'transform 0.2s',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <Phone size={16} />
                                Call
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                getDirections(hospital)
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              <Navigation size={16} />
                              Directions
                            </button>
                            {hospital.email && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSendProfile(hospital, true)
                                  }}
                                  disabled={sendingProfile}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '700',
                                    fontSize: '0.875rem',
                                    cursor: sendingProfile ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                    opacity: sendingProfile ? 0.7 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!sendingProfile) e.currentTarget.style.transform = 'translateY(-2px)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                  }}
                                >
                                  <AlertTriangle size={16} />
                                  {sendingProfile ? 'Sending...' : 'Emergency Request'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSendProfile(hospital, false)
                                  }}
                                  disabled={sendingProfile}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                    cursor: sendingProfile ? 'not-allowed' : 'pointer',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                    opacity: sendingProfile ? 0.7 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!sendingProfile) e.currentTarget.style.transform = 'translateY(-2px)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                  }}
                                >
                                  <Send size={16} />
                                  {sendingProfile ? 'Sending...' : 'Send Profile'}
                                </button>
                              </>
                            )}
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(hospital.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--bg)',
                                color: 'var(--text-primary)',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                border: '1px solid var(--border-subtle)',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }}
                            >
                              <ExternalLink size={16} />
                              More Info
                            </a>
                          </div>
                          
                          {/* Hospital Contact Info */}
                          {hospital.email && (
                            <div style={{
                              marginTop: '1rem',
                              padding: '0.75rem',
                              background: 'var(--bg)',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: 'var(--text-secondary)'
                            }}>
                              <Mail size={16} />
                              <span><strong>Email:</strong> {hospital.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem'
      }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}>
          <Building2 size={32} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.25rem' }}>
            {filteredHospitals.length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            Hospitals Found
          </div>
        </div>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}>
          <MapPin size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', marginBottom: '0.25rem' }}>
            {filteredHospitals.length > 0 ? filteredHospitals[0].distance?.toFixed(1) : 'N/A'} km
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            Nearest Hospital
          </div>
        </div>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}>
          <Star size={32} color="#fbbf24" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24', marginBottom: '0.25rem' }}>
            {filteredHospitals.length > 0 
              ? (filteredHospitals.reduce((sum, h) => sum + (h.rating || 0), 0) / filteredHospitals.length).toFixed(1)
              : 'N/A'}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            Average Rating
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        #hospital-map {
          z-index: 1;
          min-height: 600px;
        }
        .leaflet-container {
          background: var(--bg-card);
          font-family: inherit;
          height: 100% !important;
          width: 100% !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .patient-marker, .hospital-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: 1px solid var(--border-subtle) !important;
          border-radius: 8px !important;
        }
        .leaflet-control-zoom a {
          background-color: var(--bg-card) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  )
}

export default HospitalConnector
