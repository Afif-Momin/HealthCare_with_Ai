import { useState, useRef } from 'react'
import {
    Eye,
    Scan,
    Mic,
    Upload,
    AlertTriangle,
    CheckCircle,
    Loader,
    ArrowRight,
    Activity,
    Heart,
    Brain,
    Info,
    X,
    FileImage,
    FileAudio,
    Camera,
    Sparkles,
    Shield,
    Zap,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { advancedDetectionAPI } from '../services/api'

// Detection type configurations
const DETECTION_TYPES = {
    retinal: {
        id: 'retinal',
        name: 'Retinal Disease Detection',
        shortName: 'Iris Scan',
        icon: Eye,
        color: '#00d4ff',
        gradient: 'linear-gradient(135deg, #00d4ff, #0099cc)',
        description: 'AI-powered analysis of eye fundus images to detect various medical conditions',
        fileType: 'image',
        acceptedFormats: 'image/jpeg, image/png, image/jpg',
        maxSize: '10MB',
        diseases: [
            'Diabetic Retinopathy',
            'Age-related Macular Degeneration',
            'Glaucoma Indicators',
            'Cataracts',
            'Hypertensive Retinopathy',
            'Pathological Myopia'
        ],
        instructions: [
            'Upload a clear, high-resolution fundus image',
            'Ensure the image is well-lit and focused',
            'Both eyes can be analyzed separately',
            'JPEG or PNG format preferred'
        ]
    },
    skinCancer: {
        id: 'skinCancer',
        name: 'Skin Cancer Classification',
        shortName: 'Skin Cancer',
        icon: Scan,
        color: '#ff6b6b',
        gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a5a)',
        description: 'Classify skin lesions for potential malignancy using deep learning',
        fileType: 'image',
        acceptedFormats: 'image/jpeg, image/png, image/jpg',
        maxSize: '10MB',
        diseases: [
            'Melanoma (MEL)',
            'Basal Cell Carcinoma (BCC)',
            'Squamous Cell Carcinoma (SCC)',
            'Melanocytic Nevus (NV)',
            'Actinic Keratosis (AKIEC)',
            'Benign Keratosis (BKL)'
        ],
        instructions: [
            'Take a close-up photo of the skin lesion',
            'Ensure good lighting without shadows',
            'Include a ruler or coin for scale if possible',
            'Capture the entire lesion in frame'
        ]
    },
    skinLesions: {
        id: 'skinLesions',
        name: 'Skin Lesions Detection',
        shortName: 'Skin Lesions',
        icon: Activity,
        color: '#00ff88',
        gradient: 'linear-gradient(135deg, #00ff88, #00cc6a)',
        description: 'Detect and classify skin lesions using HAM10000 trained model',
        fileType: 'image',
        acceptedFormats: 'image/jpeg, image/png, image/jpg',
        maxSize: '10MB',
        diseases: [
            'Actinic keratoses',
            'Basal cell carcinoma',
            'Benign keratosis',
            'Dermatofibroma',
            'Melanoma',
            'Melanocytic nevi',
            'Vascular lesions'
        ],
        instructions: [
            'Photograph the skin lesion directly',
            'Use natural lighting when possible',
            'Keep camera steady to avoid blur',
            'Clean the area before photographing'
        ]
    },
    parkinson: {
        id: 'parkinson',
        name: 'Parkinson Speech Detection',
        shortName: 'Parkinson Speech',
        icon: Mic,
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
        description: 'Analyze speech patterns to detect Parkinson\'s disease indicators',
        fileType: 'audio',
        acceptedFormats: 'audio/wav, audio/mp3, audio/ogg, audio/mpeg',
        maxSize: '25MB',
        diseases: [
            'Voice tremor patterns',
            'Speech rate abnormalities',
            'Pitch instability',
            'Vocal jitter/shimmer'
        ],
        instructions: [
            'Record in a quiet environment',
            'Speak clearly for at least 10 seconds',
            'Read a passage or count numbers',
            'WAV format recommended for best accuracy'
        ]
    },
    gastro: {
        id: 'gastro',
        name: 'Gastrointestinal Detection',
        shortName: 'GastroAI',
        icon: Activity,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        description: 'Detect gastrointestinal conditions from endoscopy images using AI',
        fileType: 'image',
        acceptedFormats: 'image/jpeg, image/png, image/jpg',
        maxSize: '10MB',
        diseases: [
            'Polyps',
            'Ulcerative Colitis',
            'Esophagitis',
            'Dyed Lifted Polyps',
            'Dyed Resection Margins',
            'Normal Landmarks'
        ],
        instructions: [
            'Upload endoscopy images only',
            'Ensure image is clear and focused',
            'Multiple images can be analyzed',
            'JPEG or PNG format preferred'
        ]
    },
    lungCancer: {
        id: 'lungCancer',
        name: 'Lung Cancer Detection',
        shortName: 'LungAI',
        icon: Heart,
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        description: 'Detect and classify lung cancer from CT scan images',
        fileType: 'image',
        acceptedFormats: 'image/jpeg, image/png, image/jpg',
        maxSize: '15MB',
        diseases: [
            'Adenocarcinoma',
            'Large Cell Carcinoma',
            'Squamous Cell Carcinoma',
            'Normal (No Cancer)'
        ],
        instructions: [
            'Upload CT scan images',
            'Ensure scan is high quality',
            'Cross-sectional images work best',
            '98% accuracy for cancer detection'
        ]
    },
    thyroid: {
        id: 'thyroid',
        name: 'Thyroid Disease Detection',
        shortName: 'Thyroid',
        icon: Brain,
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
        description: 'Predict thyroid conditions based on lab values and patient data',
        fileType: 'form',
        acceptedFormats: 'JSON data',
        maxSize: 'N/A',
        diseases: [
            'Primary Hypothyroidism',
            'Secondary Hypothyroidism',
            'Compensated Hypothyroidism',
            'Normal Thyroid Function'
        ],
        instructions: [
            'Enter your latest lab values',
            'Include TSH, T3, T4 levels',
            'Provide relevant medical history',
            'All fields are optional but improve accuracy'
        ]
    },
    retfound: {
        id: 'retfound',
        name: 'Retinal Foundation Model',
        shortName: 'RETFound',
        icon: Eye,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        description: 'Advanced Diabetic Retinopathy grading using the state-of-the-art RETFound (ViT-Large) model',
        fileType: 'image',
        acceptedFormats: 'image/jpeg, image/png, image/tiff',
        maxSize: '10MB',
        diseases: [
            'Mild Diabetic Retinopathy',
            'Moderate Diabetic Retinopathy',
            'Severe Diabetic Retinopathy',
            'Proliferative Diabetic Retinopathy'
        ],
        instructions: [
            'Upload a high-quality fundus image',
            'Image should be centered on the macula',
            'Ensure good lighting and focus',
            'Accepts high-resolution fundus photos'
        ]
    }
}

const AdvancedDetection = () => {
    const [selectedType, setSelectedType] = useState(null)
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [expandedSection, setExpandedSection] = useState(null)
    const [activeResultIndex, setActiveResultIndex] = useState(0)
    const fileInputRef = useRef(null)

    // Thyroid form data state
    const [thyroidFormData, setThyroidFormData] = useState({
        age: 40,
        sex: 'F',
        TSH: 2.0,
        T3: 1.5,
        TT4: 8.0,
        T4U: 1.0,
        FTI: 8.0,
        TSH_measured: true,
        T3_measured: true,
        TT4_measured: true,
        T4U_measured: true,
        FTI_measured: true,
        on_thyroxine: false,
        thyroid_surgery: false,
        goitre: false,
        tumor: false,
        hypopituitary: false,
        pregnant: false,
        sick: false
    })

    const handleTypeSelect = (typeId) => {
        setSelectedType(DETECTION_TYPES[typeId])
        setFiles([])
        setPreviews([])
        setResult(null)
        setError(null)
    }

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])
            setError(null)
            setResult(null)

            // Generate previews for images
            newFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        setPreviews(prev => [...prev, { name: file.name, src: e.target.result }])
                    }
                    reader.readAsDataURL(file)
                }
            })
        }
    }

    const removeFile = (index) => {
        const fileToRemove = files[index]
        setFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter(p => p.name !== fileToRemove.name))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const droppedFiles = e.dataTransfer.files
        if (droppedFiles && droppedFiles.length > 0) {
            const newFiles = Array.from(droppedFiles)
            setFiles(prev => [...prev, ...newFiles])
            setError(null)
            setResult(null)

            newFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        setPreviews(prev => [...prev, { name: file.name, src: e.target.result }])
                    }
                    reader.readAsDataURL(file)
                }
            })
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleAnalyze = async () => {
        if (!selectedType) return

        // For thyroid, we don't need a file - we'll use form data
        if (selectedType.id !== 'thyroid' && files.length === 0) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            let response

            if (selectedType.id === 'thyroid') {
                // Thyroid uses form data, not file upload
                response = await advancedDetectionAPI.thyroid(thyroidFormData)
            } else {
                const formData = new FormData()
                files.forEach(file => {
                    formData.append('files', file)
                })

                switch (selectedType.id) {
                    case 'retinal':
                        response = await advancedDetectionAPI.retinalDisease(formData)
                        break
                    case 'skinCancer':
                        response = await advancedDetectionAPI.skinCancer(formData)
                        break
                    case 'skinLesions':
                        response = await advancedDetectionAPI.skinLesions(formData)
                        break
                    case 'parkinson':
                        response = await advancedDetectionAPI.parkinson(formData)
                        break
                    case 'gastro':
                        response = await advancedDetectionAPI.gastro(formData)
                        break
                    case 'lungCancer':
                        response = await advancedDetectionAPI.lungCancer(formData)
                        break
                    case 'retfound':
                        response = await advancedDetectionAPI.retfound(formData)
                        break
                    default:
                        throw new Error('Unknown detection type')
                }
            }

            setResult(response.data)
        } catch (err) {
            console.error('Analysis error:', err)
            setError(err.response?.data?.detail || err.message || 'Analysis failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const resetAnalysis = () => {
        setFiles([])
        setPreviews([])
        setResult(null)
        setError(null)
        setActiveResultIndex(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getRiskColor = (level) => {
        const colors = {
            'LOW': '#00ff88',
            'MODERATE': '#ffd700',
            'HIGH': '#ff6b6b',
            'CRITICAL': '#ff0000',
            'UNKNOWN': '#888888'
        }
        return colors[level] || colors.UNKNOWN
    }

    const renderDetectionCards = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        }}>
            {Object.values(DETECTION_TYPES).map((type, index) => {
                const Icon = type.icon
                const isSelected = selectedType?.id === type.id
                return (
                    <div
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        style={{
                            background: isSelected
                                ? `linear-gradient(135deg, ${type.color}15, ${type.color}08)`
                                : 'var(--bg-card)',
                            border: isSelected
                                ? `2px solid ${type.color}60`
                                : '1px solid var(--border-subtle)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            animation: `fadeInUp 0.5s ease forwards`,
                            animationDelay: `${index * 0.1}s`,
                            opacity: 0,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.borderColor = `${type.color}40`
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = `0 10px 40px ${type.color}20`
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = 'none'
                            }
                        }}
                    >
                        {/* Glow effect when selected */}
                        {isSelected && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: type.gradient,
                                boxShadow: `0 0 20px ${type.color}`,
                            }} />
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: type.gradient,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 20px ${type.color}40`,
                                flexShrink: 0,
                            }}>
                                <Icon size={28} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    marginBottom: '0.375rem',
                                    color: isSelected ? type.color : 'var(--text-primary)',
                                }}>
                                    {type.shortName}
                                </h3>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.5',
                                }}>
                                    {type.description}
                                </p>
                            </div>
                        </div>

                        {/* File type indicator */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border-subtle)',
                        }}>
                            {type.fileType === 'image' ? (
                                <FileImage size={16} color={type.color} />
                            ) : (
                                <FileAudio size={16} color={type.color} />
                            )}
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                {type.fileType === 'image' ? 'Image Upload' : 'Audio Upload'}
                            </span>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                            }}>
                                Max {type.maxSize}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )

    const renderUploadSection = () => {
        if (!selectedType) return null

        const Icon = selectedType.icon
        const isImage = selectedType.fileType === 'image'

        return (
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                animation: 'fadeInUp 0.5s ease forwards',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: selectedType.gradient,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Icon size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                {selectedType.name}
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Upload your {isImage ? 'image' : 'audio'} file for AI analysis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedType(null)
                            resetAnalysis()
                        }}
                        style={{
                            padding: '0.5rem',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Instructions */}
                <div style={{
                    background: `${selectedType.color}10`,
                    border: `1px solid ${selectedType.color}30`,
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                    }}>
                        <Info size={16} color={selectedType.color} />
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: selectedType.color,
                        }}>
                            Instructions
                        </span>
                    </div>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1.25rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                    }}>
                        {selectedType.instructions.map((instruction, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>{instruction}</li>
                        ))}
                    </ul>
                </div>

                {/* Thyroid Form - Different from file upload */}
                {selectedType.id === 'thyroid' ? (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                    }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            <Brain size={18} color={selectedType.color} />
                            Enter Lab Values & Patient Info
                        </h3>

                        {/* Basic Info Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Age</label>
                                <input
                                    type="number"
                                    value={thyroidFormData.age}
                                    onChange={(e) => setThyroidFormData({ ...thyroidFormData, age: parseInt(e.target.value) || 0 })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Sex</label>
                                <select
                                    value={thyroidFormData.sex}
                                    onChange={(e) => setThyroidFormData({ ...thyroidFormData, sex: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)',
                                        background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                    }}
                                >
                                    <option value="F">Female</option>
                                    <option value="M">Male</option>
                                </select>
                            </div>
                        </div>

                        {/* Lab Values */}
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: selectedType.color }}>Thyroid Function Tests</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                            {[
                                { key: 'TSH', label: 'TSH', unit: 'mIU/L' },
                                { key: 'T3', label: 'T3', unit: 'ng/mL' },
                                { key: 'TT4', label: 'TT4', unit: 'μg/dL' },
                                { key: 'T4U', label: 'T4U', unit: '' },
                                { key: 'FTI', label: 'FTI', unit: '' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                                        {field.label} {field.unit && `(${field.unit})`}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={thyroidFormData[field.key]}
                                        onChange={(e) => setThyroidFormData({ ...thyroidFormData, [field.key]: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border-subtle)',
                                            background: 'var(--bg-tertiary)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Medical History */}
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: selectedType.color }}>Medical History</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                            {[
                                { key: 'on_thyroxine', label: 'On Thyroxine' },
                                { key: 'thyroid_surgery', label: 'Thyroid Surgery' },
                                { key: 'goitre', label: 'Goitre' },
                                { key: 'tumor', label: 'Tumor' },
                                { key: 'hypopituitary', label: 'Hypopituitary' },
                                { key: 'pregnant', label: 'Pregnant' },
                            ].map((field) => (
                                <label key={field.key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    background: thyroidFormData[field.key] ? `${selectedType.color}20` : 'transparent',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={thyroidFormData[field.key]}
                                        onChange={(e) => setThyroidFormData({ ...thyroidFormData, [field.key]: e.target.checked })}
                                        style={{ accentColor: selectedType.color }}
                                    />
                                    {field.label}
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Upload Area - For non-thyroid types */
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        style={{
                            border: `2px dashed ${files.length > 0 ? selectedType.color : 'var(--border-light)'}`,
                            borderRadius: '16px',
                            padding: '2.5rem',
                            textAlign: 'center',
                            cursor: 'default',
                            transition: 'all 0.3s ease',
                            background: files.length > 0 ? `${selectedType.color}08` : 'transparent',
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={selectedType.acceptedFormats}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {files.length > 0 ? (
                            <div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    {files.map((file, index) => {
                                        const preview = previews.find(p => p.name === file.name)?.src
                                        return (
                                            <div key={index} style={{
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '12px',
                                                padding: '0.75rem',
                                                border: '1px solid var(--border-subtle)',
                                                position: 'relative'
                                            }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removeFile(index)
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-subtle)',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        color: 'var(--text-secondary)'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>

                                                {preview && isImage ? (
                                                    <img
                                                        src={preview}
                                                        alt={file.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            marginBottom: '0.5rem'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100px',
                                                        background: selectedType.gradient,
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        {isImage ? <FileImage size={24} color="white" /> : <FileAudio size={24} color="white" />}
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        )
                                    })}

                                    {/* Add More Button */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: '2px dashed var(--border-subtle)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            minHeight: '150px',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                                        <span style={{ fontSize: '0.9rem' }}>Add More</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setFiles([])}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'transparent',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                }}>
                                    <Upload size={36} color="var(--text-muted)" />
                                </div>
                                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                                    Drop your {isImage ? 'image' : 'audio'} file here
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                    or click to browse
                                </p>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    background: 'var(--bg-tertiary)',
                                    display: 'inline-block',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                }}>
                                    Supported: {selectedType.acceptedFormats.replace(/\w+\//g, '.').toUpperCase()}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Analyze Button */}
                {/* Analyze Button */}
                {(files.length > 0 || selectedType?.id === 'thyroid') && !result && (
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: loading ? 'var(--bg-tertiary)' : selectedType.gradient,
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.3s ease',
                            boxShadow: loading ? 'none' : `0 4px 20px ${selectedType.color}40`,
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader size={20} className="spinning" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Analyze with AI
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                )}

                {/* Error Display */}
                {error && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <AlertTriangle size={20} color="#ff6b6b" />
                        <span style={{ color: '#ff6b6b' }}>{error}</span>
                    </div>
                )}
            </div>
        )
    }

    const renderResults = () => {
        if (!result) return null

        // Handle batch results or single result (Thyroid)
        const results = result.results || []
        const currentResult = results.length > 0 ? results[activeResultIndex] : { status: 'success', predictions: result.predictions || result }

        if (!currentResult) return null

        const predictions = currentResult.status === 'success' ? (currentResult.predictions || currentResult) : {}
        const isRetinal = selectedType?.id === 'retinal'
        const isSkinCancer = selectedType?.id === 'skinCancer'
        const isSkinLesions = selectedType?.id === 'skinLesions'
        const isParkinson = selectedType?.id === 'parkinson'
        const isGastro = selectedType?.id === 'gastro'
        const isLungCancer = selectedType?.id === 'lungCancer'
        const isThyroid = selectedType?.id === 'thyroid'
        const isRetFound = selectedType?.id === 'retfound'

        return (
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                padding: '2rem',
                animation: 'fadeInUp 0.5s ease forwards',
            }}>
                {/* Results Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid var(--border-subtle)',
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
                    }}>
                        <CheckCircle size={28} color="white" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            Analysis Complete
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {result.model || selectedType?.name}
                        </p>
                    </div>
                    <button
                        onClick={resetAnalysis}
                        style={{
                            marginLeft: 'auto',
                            padding: '0.75rem 1.5rem',
                            background: selectedType?.gradient,
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        New Analysis
                    </button>
                </div>

                {/* Batch Result Navigation */}
                {results.length > 1 && (
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem'
                    }}>
                        {results.map((res, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveResultIndex(index)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    border: `1px solid ${activeResultIndex === index ? selectedType.color : 'var(--border-subtle)'}`,
                                    background: activeResultIndex === index ? `${selectedType.color}15` : 'var(--bg-tertiary)',
                                    color: activeResultIndex === index ? selectedType.color : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: '150px'
                                }}
                            >
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: res.status === 'success' ? '#10b981' : '#ef4444'
                                }} />
                                <span style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '120px',
                                    fontSize: '0.9rem'
                                }}>
                                    {res.filename}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Batch Item Error */}
                {currentResult.status === 'error' && (
                    <div style={{
                        padding: '1.5rem',
                        background: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: '12px',
                        color: '#b91c1c',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <AlertTriangle size={24} />
                        <div>
                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Analysis Failed</p>
                            <p>{currentResult.error || 'Unknown error occurred processing this file.'}</p>
                        </div>
                    </div>
                )}

                {/* Retinal Disease Results */}
                {isRetinal && predictions.detected_diseases && (
                    <div>
                        {predictions.detected_diseases.length > 0 ? (
                            <>
                                {/* Summary Stats */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                }}>
                                    <div style={{
                                        background: 'rgba(255, 107, 107, 0.1)',
                                        border: '1px solid rgba(255, 107, 107, 0.3)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ff6b6b' }}>
                                            {predictions.risk_counts?.high || predictions.diseases_by_risk?.high?.length || 0}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#ff6b6b', fontWeight: '600' }}>HIGH RISK</p>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 215, 0, 0.1)',
                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ffd700' }}>
                                            {predictions.risk_counts?.moderate || predictions.diseases_by_risk?.moderate?.length || 0}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: '600' }}>MODERATE RISK</p>
                                    </div>
                                    <div style={{
                                        background: 'rgba(0, 255, 136, 0.1)',
                                        border: '1px solid rgba(0, 255, 136, 0.3)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ fontSize: '2rem', fontWeight: '800', color: '#00ff88' }}>
                                            {predictions.risk_counts?.low || predictions.diseases_by_risk?.low?.length || 0}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: '600' }}>LOW RISK</p>
                                    </div>
                                </div>

                                {/* High Risk Conditions */}
                                {predictions.diseases_by_risk?.high?.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#ff6b6b',
                                        }}>
                                            <AlertTriangle size={18} />
                                            High Risk Conditions ({predictions.diseases_by_risk.high.length})
                                        </h3>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {predictions.diseases_by_risk.high.map((disease, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: 'rgba(255, 107, 107, 0.1)',
                                                        border: '1px solid rgba(255, 107, 107, 0.3)',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                                {disease.full_name || disease.disease}
                                                            </p>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                                {disease.disease}
                                                            </p>
                                                        </div>
                                                        <span style={{
                                                            background: '#ff6b6b',
                                                            color: 'white',
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {disease.confidence}%
                                                        </span>
                                                    </div>
                                                    {disease.description && (
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                            {disease.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Moderate Risk Conditions */}
                                {predictions.diseases_by_risk?.moderate?.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#ffd700',
                                        }}>
                                            <Info size={18} />
                                            Moderate Risk Conditions ({predictions.diseases_by_risk.moderate.length})
                                        </h3>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {predictions.diseases_by_risk.moderate.map((disease, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: 'rgba(255, 215, 0, 0.1)',
                                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                                {disease.full_name || disease.disease}
                                                            </p>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                                {disease.disease}
                                                            </p>
                                                        </div>
                                                        <span style={{
                                                            background: '#ffd700',
                                                            color: '#000',
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {disease.confidence}%
                                                        </span>
                                                    </div>
                                                    {disease.description && (
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                            {disease.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Low Risk Conditions */}
                                {predictions.diseases_by_risk?.low?.length > 0 && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#00ff88',
                                        }}>
                                            <CheckCircle size={18} />
                                            Low Risk Conditions ({predictions.diseases_by_risk.low.length})
                                        </h3>
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {predictions.diseases_by_risk.low.map((disease, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: 'rgba(0, 255, 136, 0.1)',
                                                        border: '1px solid rgba(0, 255, 136, 0.3)',
                                                        borderRadius: '12px',
                                                        padding: '1rem',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                                {disease.full_name || disease.disease}
                                                            </p>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                                {disease.disease}
                                                            </p>
                                                        </div>
                                                        <span style={{
                                                            background: '#00ff88',
                                                            color: '#000',
                                                            padding: '0.375rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {disease.confidence}%
                                                        </span>
                                                    </div>
                                                    {disease.description && (
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                            {disease.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Immediate Attention Warning */}
                                {predictions.summary?.requires_immediate_attention && (
                                    <div style={{
                                        background: 'rgba(255, 0, 0, 0.1)',
                                        border: '2px solid rgba(255, 0, 0, 0.5)',
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '1.5rem',
                                    }}>
                                        <AlertTriangle size={24} color="#ff0000" />
                                        <div>
                                            <p style={{ fontWeight: '700', color: '#ff6b6b', marginBottom: '0.25rem' }}>
                                                Immediate Medical Attention Recommended
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                High-risk conditions detected. Please consult an ophthalmologist as soon as possible.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{
                                background: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                marginBottom: '2rem',
                            }}>
                                <CheckCircle size={48} color="#00ff88" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>No Diseases Detected</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    The analysis did not detect any significant conditions
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Skin Cancer Results */}
                {isSkinCancer && predictions.primary_classification && (
                    <div>
                        {/* Summary Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                background: 'rgba(255, 107, 107, 0.1)',
                                border: '1px solid rgba(255, 107, 107, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ff6b6b' }}>
                                    {predictions.risk_counts?.high || 0}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#ff6b6b', fontWeight: '600' }}>HIGH RISK</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ffd700' }}>
                                    {predictions.risk_counts?.moderate || 0}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: '600' }}>MODERATE RISK</p>
                            </div>
                            <div style={{
                                background: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#00ff88' }}>
                                    {predictions.risk_counts?.low || 0}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: '600' }}>LOW RISK</p>
                            </div>
                        </div>

                        {/* Primary Classification */}
                        <div style={{
                            background: `${getRiskColor(predictions.primary_classification.risk_level)}15`,
                            border: `1px solid ${getRiskColor(predictions.primary_classification.risk_level)}40`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Primary Classification</h3>
                                <span style={{
                                    background: getRiskColor(predictions.primary_classification.risk_level),
                                    color: 'white',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}>
                                    {predictions.primary_classification.risk_level} Risk
                                </span>
                            </div>
                            <p style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: getRiskColor(predictions.primary_classification.risk_level),
                                marginBottom: '0.25rem',
                            }}>
                                {predictions.primary_classification.full_name || predictions.primary_classification.class}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                                {predictions.primary_classification.class}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {predictions.primary_classification.description}
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        height: '8px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${predictions.primary_classification.confidence}%`,
                                            height: '100%',
                                            background: getRiskColor(predictions.primary_classification.risk_level),
                                            borderRadius: '4px',
                                        }} />
                                    </div>
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                    {predictions.primary_classification.confidence}%
                                </span>
                            </div>
                        </div>

                        {/* High Risk Conditions */}
                        {predictions.diseases_by_risk?.high?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#ff6b6b',
                                }}>
                                    <AlertTriangle size={18} />
                                    High Risk Matches
                                </h3>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {predictions.diseases_by_risk.high.map((condition, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255, 107, 107, 0.1)',
                                            border: '1px solid rgba(255, 107, 107, 0.3)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                        {condition.full_name || condition.class}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        {condition.class || condition.disease}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    background: '#ff6b6b',
                                                    color: 'white',
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                }}>
                                                    {condition.confidence || condition.percentage}%
                                                </span>
                                            </div>
                                            {condition.description && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                    {condition.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendation */}
                        {predictions.risk_assessment && (
                            <div style={{
                                background: predictions.risk_assessment.is_high_risk
                                    ? 'rgba(255, 107, 107, 0.1)'
                                    : 'rgba(0, 255, 136, 0.1)',
                                border: `1px solid ${predictions.risk_assessment.is_high_risk
                                    ? 'rgba(255, 107, 107, 0.3)'
                                    : 'rgba(0, 255, 136, 0.3)'}`,
                                borderRadius: '12px',
                                padding: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                                <Shield size={24} color={predictions.risk_assessment.is_high_risk ? '#ff6b6b' : '#00ff88'} />
                                <div>
                                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Recommendation</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {predictions.risk_assessment.recommendation}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Skin Lesions Results */}
                {isSkinLesions && predictions.primary_diagnosis && (
                    <div>
                        {/* Summary Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                background: 'rgba(255, 107, 107, 0.1)',
                                border: '1px solid rgba(255, 107, 107, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ff6b6b' }}>
                                    {predictions.risk_counts?.high || 0}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#ff6b6b', fontWeight: '600' }}>HIGH/CRITICAL</p>
                            </div>
                            <div style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#ffd700' }}>
                                    {predictions.risk_counts?.moderate || 0}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: '600' }}>MODERATE</p>
                            </div>
                            <div style={{
                                background: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                borderRadius: '12px',
                                padding: '1rem',
                                textAlign: 'center',
                            }}>
                                <p style={{ fontSize: '2rem', fontWeight: '800', color: '#00ff88' }}>
                                    {predictions.risk_counts?.low || 0}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#00ff88', fontWeight: '600' }}>LOW RISK</p>
                            </div>
                        </div>

                        {/* Primary Diagnosis */}
                        <div style={{
                            background: `${getRiskColor(predictions.primary_diagnosis.severity_level || predictions.primary_diagnosis.risk_level)}15`,
                            border: `1px solid ${getRiskColor(predictions.primary_diagnosis.severity_level || predictions.primary_diagnosis.risk_level)}40`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Primary Diagnosis</h3>
                                <span style={{
                                    background: getRiskColor(predictions.primary_diagnosis.severity_level || predictions.primary_diagnosis.risk_level),
                                    color: 'white',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}>
                                    {predictions.primary_diagnosis.severity_level || predictions.primary_diagnosis.risk_level}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                marginBottom: '0.25rem',
                                color: getRiskColor(predictions.primary_diagnosis.severity_level || predictions.primary_diagnosis.risk_level),
                            }}>
                                {predictions.primary_diagnosis.full_name || predictions.primary_diagnosis.lesion_type}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                                {predictions.primary_diagnosis.lesion_type}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {predictions.primary_diagnosis.description}
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        height: '8px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${predictions.primary_diagnosis.confidence}%`,
                                            height: '100%',
                                            background: getRiskColor(predictions.primary_diagnosis.severity_level || predictions.primary_diagnosis.risk_level),
                                            borderRadius: '4px',
                                        }} />
                                    </div>
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                    {predictions.primary_diagnosis.confidence}%
                                </span>
                            </div>
                        </div>

                        {/* High/Critical Risk Conditions */}
                        {predictions.diseases_by_risk?.high?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#ff6b6b',
                                }}>
                                    <AlertTriangle size={18} />
                                    High/Critical Risk Matches
                                </h3>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {predictions.diseases_by_risk.high.map((condition, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255, 107, 107, 0.1)',
                                            border: '1px solid rgba(255, 107, 107, 0.3)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                        {condition.full_name || condition.lesion_type}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        {condition.lesion_type}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    background: '#ff6b6b',
                                                    color: 'white',
                                                    padding: '0.375rem 0.75rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                }}>
                                                    {condition.confidence || condition.percentage}%
                                                </span>
                                            </div>
                                            {condition.description && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                    {condition.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Risk Assessment */}
                        {predictions.risk_assessment && (
                            <div style={{
                                background: predictions.risk_assessment.is_potentially_malignant
                                    ? 'rgba(255, 107, 107, 0.1)'
                                    : 'rgba(0, 255, 136, 0.1)',
                                border: `1px solid ${predictions.risk_assessment.is_potentially_malignant
                                    ? 'rgba(255, 107, 107, 0.3)'
                                    : 'rgba(0, 255, 136, 0.3)'}`,
                                borderRadius: '12px',
                                padding: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}>
                                <Shield size={24} color={predictions.risk_assessment.is_potentially_malignant ? '#ff6b6b' : '#00ff88'} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600' }}>Risk Score</span>
                                        <span style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '800',
                                            color: predictions.risk_assessment.is_potentially_malignant ? '#ff6b6b' : '#00ff88',
                                        }}>
                                            {predictions.risk_assessment.risk_score}%
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {predictions.risk_assessment.primary_recommendation}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Parkinson Results */}
                {isParkinson && predictions.assessment && (
                    <div>
                        <div style={{
                            background: `${getRiskColor(predictions.assessment.risk_level.replace('_RISK', ''))}15`,
                            border: `1px solid ${getRiskColor(predictions.assessment.risk_level.replace('_RISK', ''))}40`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Risk Assessment</h3>
                                <span style={{
                                    background: getRiskColor(predictions.assessment.risk_level.replace('_RISK', '')),
                                    color: 'white',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}>
                                    {predictions.assessment.risk_level.replace('_', ' ')}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '3rem',
                                fontWeight: '800',
                                marginBottom: '0.5rem',
                            }}>
                                {predictions.assessment.risk_score}%
                            </p>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {predictions.assessment.recommendation}
                            </p>
                        </div>

                        {predictions.parkinson_indicators && (
                            <div>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem',
                                }}>
                                    Speech Indicators Analyzed
                                </h3>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {predictions.parkinson_indicators.map((indicator, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                background: 'var(--bg-tertiary)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '12px',
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                    {indicator.feature}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {indicator.description}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: indicator.status === 'NORMAL' || indicator.status === 'STABLE' || indicator.status === 'CONSISTENT'
                                                    ? 'rgba(0, 255, 136, 0.2)'
                                                    : 'rgba(255, 107, 107, 0.2)',
                                                color: indicator.status === 'NORMAL' || indicator.status === 'STABLE' || indicator.status === 'CONSISTENT'
                                                    ? '#00ff88'
                                                    : '#ff6b6b',
                                                padding: '0.375rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                            }}>
                                                {indicator.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* GastroAI Results */}
                {isGastro && predictions.primary_diagnosis && (
                    <div>
                        {/* Primary Diagnosis */}
                        <div style={{
                            background: `${getRiskColor(predictions.primary_diagnosis.risk_level)}15`,
                            border: `1px solid ${getRiskColor(predictions.primary_diagnosis.risk_level)}40`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Primary Diagnosis</h3>
                                <span style={{
                                    background: getRiskColor(predictions.primary_diagnosis.risk_level),
                                    color: 'white',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}>
                                    {predictions.primary_diagnosis.risk_level} RISK
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Activity size={32} color={getRiskColor(predictions.primary_diagnosis.risk_level)} />
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                        {predictions.primary_diagnosis.full_name}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Confidence: <strong>{predictions.primary_diagnosis.confidence}%</strong>
                                    </p>
                                </div>
                            </div>
                            {predictions.primary_diagnosis.description && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        {predictions.primary_diagnosis.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* All Detected Conditions */}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Detailed Analysis</h3>
                        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {predictions.detected_conditions.map((condition, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    opacity: condition.confidence < 10 ? 0.7 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{condition.full_name}</p>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '4px',
                                                background: `${getRiskColor(condition.risk_level)}20`,
                                                color: getRiskColor(condition.risk_level),
                                                fontWeight: '600'
                                            }}>
                                                {condition.risk_level}
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: '700' }}>{condition.confidence}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendation */}
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderLeft: `4px solid ${getRiskColor(predictions.primary_diagnosis.risk_level)}`,
                            padding: '1rem',
                            borderRadius: '0 8px 8px 0',
                        }}>
                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Recommendation</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {predictions.primary_diagnosis.recommendation}
                            </p>
                        </div>
                    </div>
                )}

                {/* LungAI Results */}
                {isLungCancer && predictions.primary_classification && (
                    <div>
                        {/* Cancer Detection Alert */}
                        {predictions.cancer_detection.is_cancer_detected ? (
                            <div style={{
                                background: 'rgba(255, 107, 107, 0.1)',
                                border: '1px solid #ff6b6b',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <AlertTriangle size={32} color="#ff6b6b" style={{ marginBottom: '0.5rem' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ff6b6b', marginBottom: '0.5rem' }}>
                                    Potential Abnormality Detected
                                </h2>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    {predictions.cancer_detection.cancer_type}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Probability: <strong>{predictions.cancer_detection.cancer_probability}%</strong>
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid #00ff88',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <CheckCircle size={32} color="#00ff88" style={{ marginBottom: '0.5rem' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#00ff88', marginBottom: '0.5rem' }}>
                                    No Cancer Indicators Detected
                                </h2>
                                <p style={{ fontSize: '1.1rem' }}>
                                    Normal Findings
                                </p>
                            </div>
                        )}

                        {/* Detailed Classifications */}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Classification Details</h3>
                        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {predictions.detected_conditions.map((condition, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(condition.risk_level) }}></div>
                                        <span>{condition.full_name}</span>
                                    </div>
                                    <span style={{ fontWeight: '700' }}>{condition.confidence}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Thyroid Results */}
                {isThyroid && predictions.primary_diagnosis && (
                    <div>
                        {/* Diagnosis */}
                        <div style={{
                            background: `${getRiskColor(predictions.primary_diagnosis.risk_level)}15`,
                            border: `1px solid ${getRiskColor(predictions.primary_diagnosis.risk_level)}40`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem'
                        }}>
                            <Brain size={40} color={getRiskColor(predictions.primary_diagnosis.risk_level)} />
                            <div>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                                    Assessment
                                </h3>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                    {predictions.primary_diagnosis.full_name}
                                </h2>
                                <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                                    {predictions.primary_diagnosis.description}
                                </p>
                            </div>
                        </div>

                        {/* Lab Analysis */}
                        {predictions.lab_analysis && predictions.lab_analysis.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Lab Value Analysis</h3>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {predictions.lab_analysis.map((lab, i) => (
                                        <div key={i} style={{
                                            padding: '1rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                <p style={{ fontWeight: '600' }}>{lab.test}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ref: {lab.reference_range}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{lab.value} <span style={{ fontSize: '0.8rem', fontWeight: '400' }}>{lab.unit}</span></p>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    color: lab.status === 'NORMAL' ? '#00ff88' : '#ff6b6b'
                                                }}>
                                                    {lab.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendation */}
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderLeft: `4px solid ${getRiskColor(predictions.primary_diagnosis.risk_level)}`,
                            padding: '1rem',
                            borderRadius: '0 8px 8px 0',
                        }}>
                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Recommendation</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {predictions.primary_diagnosis.recommendation}
                            </p>
                        </div>
                    </div>
                )}

                {/* RETFound Results */}
                {isRetFound && predictions.primary_diagnosis && (
                    <div>
                        {/* Primary Diagnosis */}
                        <div style={{
                            background: `${getRiskColor(predictions.primary_diagnosis.risk_level)}15`,
                            border: `1px solid ${getRiskColor(predictions.primary_diagnosis.risk_level)}40`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Primary Diagnosis (RETFound)</h3>
                                <span style={{
                                    background: getRiskColor(predictions.primary_diagnosis.risk_level),
                                    color: 'white',
                                    padding: '0.375rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                }}>
                                    {predictions.primary_diagnosis.risk_level} RISK
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Eye size={32} color={getRiskColor(predictions.primary_diagnosis.risk_level)} />
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                                        {predictions.primary_diagnosis.full_name}
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Confidence: <strong>{predictions.primary_diagnosis.confidence}%</strong>
                                    </p>
                                </div>
                            </div>
                            {predictions.primary_diagnosis.description && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        {predictions.primary_diagnosis.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* All Detected Conditions */}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Detailed Analysis</h3>
                        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {predictions.detected_conditions.map((condition, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    opacity: condition.confidence < 10 ? 0.7 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{condition.full_name}</p>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '4px',
                                                background: `${getRiskColor(condition.risk_level)}20`,
                                                color: getRiskColor(condition.risk_level),
                                                fontWeight: '600'
                                            }}>
                                                {condition.risk_level}
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: '700' }}>{condition.confidence}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendation */}
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderLeft: `4px solid ${getRiskColor(predictions.primary_diagnosis.risk_level)}`,
                            padding: '1rem',
                            borderRadius: '0 8px 8px 0',
                        }}>
                            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Recommendation</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                {predictions.primary_diagnosis.recommendation}
                            </p>
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                }}>
                    <Info size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <strong>Medical Disclaimer:</strong> This AI analysis is for screening purposes only and should not be
                        considered a medical diagnosis. Please consult with a qualified healthcare professional for proper
                        evaluation and treatment recommendations.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                marginBottom: '2rem',
                animation: 'fadeInUp 0.5s ease forwards',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 24px rgba(0, 212, 255, 0.4)',
                    }}>
                        <Brain size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            marginBottom: '0.25rem',
                            background: 'linear-gradient(135deg, #00d4ff, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Advanced Visual & Audio Detection
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            AI-powered medical screening using image and speech analysis
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature badges */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '2rem',
            }}>
                {[
                    { icon: Zap, label: 'Real-time Analysis', color: '#ffd700' },
                    { icon: Shield, label: 'HIPAA Compliant', color: '#00ff88' },
                    { icon: Brain, label: 'Deep Learning', color: '#00d4ff' },
                    { icon: Heart, label: 'Clinical Grade', color: '#ff6b6b' },
                ].map((badge, i) => {
                    const Icon = badge.icon
                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: `${badge.color}10`,
                                border: `1px solid ${badge.color}30`,
                                borderRadius: '100px',
                                fontSize: '0.8rem',
                                color: badge.color,
                                fontWeight: '600',
                            }}
                        >
                            <Icon size={14} />
                            {badge.label}
                        </div>
                    )
                })}
            </div>

            {/* Detection Type Selection */}
            {!result && (
                <>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <Sparkles size={20} color="var(--accent-primary)" />
                        Select Detection Type
                    </h2>
                    {renderDetectionCards()}
                </>
            )}

            {/* Upload Section */}
            {renderUploadSection()}

            {/* Results Section */}
            {renderResults()}

            {/* Spinning animation style */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    )
}

export default AdvancedDetection
