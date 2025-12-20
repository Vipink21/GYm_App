import { useState, useEffect } from 'react'
import { Plus, Search, Dumbbell, Play, Edit2, Trash2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { exerciseService, Exercise } from '../../services/exerciseService'
import { auditService } from '../../services/auditService'
import { showSuccess, showError, showConfirm } from '../../utils/swal'
import styles from './Exercises.module.css'

export function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterGroup, setFilterGroup] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

    const [formData, setFormData] = useState<{
        name: string;
        muscle_group: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        equipment: string;
        description: string;
        video_url: string;
    }>({
        name: '',
        muscle_group: 'Chest',
        difficulty: 'beginner',
        equipment: 'Dumbbells',
        description: '',
        video_url: ''
    })

    useEffect(() => {
        loadExercises()
    }, [])

    const loadExercises = async () => {
        try {
            setLoading(true)
            const data = await exerciseService.getAllExercises()
            setExercises(data)
        } catch (error) {
            console.error('Failed to load exercises:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingExercise) {
                await exerciseService.updateExercise(editingExercise.id, formData)
                await auditService.logAction('update', 'exercise', editingExercise.id, { name: formData.name })
            } else {
                const newEx = await exerciseService.createExercise(formData)
                await auditService.logAction('create', 'exercise', newEx.id, { name: formData.name })
            }
            showSuccess('Success', `Exercise ${editingExercise ? 'updated' : 'created'} successfully.`)
            setShowModal(false)
            loadExercises()
        } catch (error: any) {
            showError('Error', error.message)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        const result = await showConfirm('Delete Exercise', `Are you sure you want to delete "${name}" from the global library?`)
        if (result.isConfirmed) {
            try {
                await exerciseService.deleteExercise(id)
                await auditService.logAction('delete', 'exercise', id, { name })
                showSuccess('Deleted', 'Exercise removed successfully.')
                loadExercises()
            } catch (error: any) {
                showError('Error', error.message)
            }
        }
    }

    const filteredExercises = exercises.filter(ex =>
        (ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterGroup === 'all' || ex.muscle_group.toLowerCase() === filterGroup.toLowerCase())
    )

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Global Exercise Library</h1>
                    <p className={styles.subtitle}>Curate exercises available to all gym partners and trainers</p>
                </div>
                <Button onClick={() => {
                    setEditingExercise(null)
                    setFormData({ name: '', muscle_group: 'Chest', difficulty: 'beginner', equipment: 'Dumbbells', description: '', video_url: '' })
                    setShowModal(true)
                }}>
                    <Plus size={20} /> Add New Exercise
                </Button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={filterGroup}
                    onChange={e => setFilterGroup(e.target.value)}
                >
                    <option value="all">All Muscle Groups</option>
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="legs">Legs</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="arms">Arms</option>
                    <option value="core">Core</option>
                </select>
            </div>

            <Card padding="none">
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Exercise</th>
                                <th>Muscle Group</th>
                                <th>Equipment</th>
                                <th>Difficulty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className={styles.loading}>Loading library...</td></tr>
                            ) : filteredExercises.length > 0 ? (
                                filteredExercises.map(ex => (
                                    <tr key={ex.id}>
                                        <td>
                                            <div className={styles.exerciseCell}>
                                                <div className={styles.iconBox}>
                                                    <Dumbbell size={18} />
                                                </div>
                                                <div>
                                                    <div className={styles.exerciseName}>{ex.name}</div>
                                                    <div className={styles.exerciseDesc}>{ex.description.substring(0, 50)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={styles.tag}>{ex.muscle_group}</span></td>
                                        <td>{ex.equipment}</td>
                                        <td>
                                            <span className={`${styles.difficulty} ${styles[ex.difficulty]}`}>
                                                {ex.difficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {ex.video_url && (
                                                    <button className={styles.actionBtn} title="Watch Video">
                                                        <Play size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                    onClick={() => {
                                                        setEditingExercise(ex)
                                                        setFormData({
                                                            name: ex.name,
                                                            muscle_group: ex.muscle_group,
                                                            difficulty: ex.difficulty,
                                                            equipment: ex.equipment,
                                                            description: ex.description,
                                                            video_url: ex.video_url || ''
                                                        })
                                                        setShowModal(true)
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.delete}`}
                                                    title="Delete"
                                                    onClick={() => handleDelete(ex.id, ex.name)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className={styles.empty}>No exercises found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
            >
                <form onSubmit={handleSave} className={styles.modalForm}>
                    <div className="premium-form-group">
                        <label className="premium-label">Exercise Name</label>
                        <input
                            type="text"
                            required
                            className="premium-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="premium-form-row">
                        <div className="premium-form-group">
                            <label className="premium-label">Muscle Group</label>
                            <select
                                className="premium-input"
                                value={formData.muscle_group}
                                onChange={e => setFormData({ ...formData, muscle_group: e.target.value })}
                            >
                                <option value="Chest">Chest</option>
                                <option value="Back">Back</option>
                                <option value="Legs">Legs</option>
                                <option value="Shoulders">Shoulders</option>
                                <option value="Arms">Arms</option>
                                <option value="Core">Core</option>
                                <option value="Full Body">Full Body</option>
                            </select>
                        </div>
                        <div className="premium-form-group">
                            <label className="premium-label">Difficulty</label>
                            <select
                                className="premium-input"
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="premium-form-group">
                        <label className="premium-label">Equipment Needed</label>
                        <input
                            type="text"
                            className="premium-input"
                            value={formData.equipment}
                            onChange={e => setFormData({ ...formData, equipment: e.target.value })}
                            placeholder="e.g., Dumbbells, Barbell, None"
                        />
                    </div>

                    <div className="premium-form-group">
                        <label className="premium-label">Instructions / Description</label>
                        <textarea
                            className="premium-input"
                            style={{ height: '100px' }}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="premium-form-group">
                        <label className="premium-label">Video Tutorial URL (YouTube/Vimeo)</label>
                        <input
                            type="url"
                            className="premium-input"
                            value={formData.video_url}
                            onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit">Save Exercise</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
