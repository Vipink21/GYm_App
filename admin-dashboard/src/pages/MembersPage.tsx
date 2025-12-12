import { Plus, Search, Filter, Download } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import styles from './MembersPage.module.css'

export function MembersPage() {
    // Sample data - would come from Firebase in production
    const members = [
        { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', plan: 'Gold Annual', status: 'active', trainer: 'Sarah M.', joined: 'Jan 15, 2024' },
        { id: '2', name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya@email.com', plan: 'Silver Monthly', status: 'active', trainer: 'Mike T.', joined: 'Feb 20, 2024' },
        { id: '3', name: 'Amit Kumar', phone: '+91 76543 21098', email: 'amit@email.com', plan: 'Gold Annual', status: 'expiring', trainer: 'Sarah M.', joined: 'Mar 10, 2024' },
        { id: '4', name: 'Sneha Gupta', phone: '+91 65432 10987', email: 'sneha@email.com', plan: 'Platinum', status: 'active', trainer: 'John D.', joined: 'Apr 5, 2024' },
        { id: '5', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', plan: 'Gold Annual', status: 'expired', trainer: 'Sarah M.', joined: 'May 12, 2024' },
    ]

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return styles.statusActive
            case 'expiring': return styles.statusExpiring
            case 'expired': return styles.statusExpired
            default: return ''
        }
    }

    return (
        <div className={styles.page}>
            {/* Header Actions */}
            <div className={styles.actions}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input type="text" placeholder="Search members..." className={styles.searchInput} />
                </div>
                <div className={styles.actionButtons}>
                    <Button variant="ghost" size="sm">
                        <Filter size={16} /> Filter
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Download size={16} /> Export
                    </Button>
                    <Button size="sm">
                        <Plus size={16} /> Add Member
                    </Button>
                </div>
            </div>

            {/* Members Table */}
            <Card padding="sm">
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Contact</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Trainer</th>
                            <th>Joined</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.id}>
                                <td>
                                    <div className={styles.memberCell}>
                                        <div className={styles.avatar}>{member.name.charAt(0)}</div>
                                        <span className={styles.memberName}>{member.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.contactCell}>
                                        <span>{member.phone}</span>
                                        <span className={styles.email}>{member.email}</span>
                                    </div>
                                </td>
                                <td>{member.plan}</td>
                                <td>
                                    <span className={`${styles.status} ${getStatusClass(member.status)}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td>{member.trainer}</td>
                                <td>{member.joined}</td>
                                <td>
                                    <button className={styles.moreBtn}>•••</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    )
}
