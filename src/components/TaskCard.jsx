import { Card, Button, Tag, Dropdown } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'

const columns = [
  { key: 'pending', title: 'Pending', color: '#ffec3d' },
  { key: 'in_progress', title: 'In Progress', color: '#1890ff' },
  { key: 'blocked', title: 'Blocked', color: '#ff4d4f' },
  { key: 'in_review', title: 'In Review', color: '#722ed1' },
  { key: 'done', title: 'Done', color: '#52c41a' },
]

export function TaskCard({ task, projects, onStatusChange, onDelete, onUpdatePRLink }) {
  return (
    <Card 
      key={task.id} 
      title={task.title}
      extra={
        <Dropdown
          menu={{
            items: columns.map(c => ({ 
              key: c.key, 
              label: c.title,
              onClick: () => onStatusChange(task.id, c.key)
            }))
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      }
      actions={[
        (task.status === 'in_review' || task.status === 'done') && (
          <Button type="text" onClick={() => {
            const link = prompt('Enter PR URL:', task.prLink || 'https://github.com/')
            if (link) onUpdatePRLink(task.id, link)
          }}>
            🔗 PR Link
          </Button>
        ),
        <Button type="text" danger onClick={() => onDelete(task.id)}>Delete</Button>
      ].filter(Boolean)}
    >
      <p>{task.description}</p>
      {task.prLink && (
        <a href={task.prLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          🔗 View PR
        </a>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color={task.type === 'fix' ? 'red' : task.type === 'enhance' ? 'orange' : 'blue'}>
            {task.type === 'fix' ? '🔧' : task.type === 'enhance' ? '🚀' : '✨'} {task.type}
          </Tag>
          <Tag color={task.priority >= 4 ? 'red' : task.priority >= 3 ? 'orange' : 'default'}>
            ⭐ Priority: {task.priority}
          </Tag>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="blue">👤 {task.assignee || 'Unassigned'}</Tag>
          {task.project && <Tag color="green">📁 {projects.find(p => p.id === task.project)?.name || 'Unknown'}</Tag>}
        </div>
      </div>
    </Card>
  )
}

export { columns }
