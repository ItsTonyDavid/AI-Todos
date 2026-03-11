import { Layout, Tabs, Tag, Button, Select, Form, message } from 'antd'
import { PlusOutlined, FireOutlined, FolderOutlined } from '@ant-design/icons'
import { db } from './firebase/config'
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { TaskCard, columns } from './components/TaskCard'
import { TaskModal } from './components/TaskModal'
import { ProjectModal } from './components/ProjectModal'

const { Header, Content } = Layout

function App() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [form] = Form.useForm()
  const [projectForm] = Form.useForm()

  // Fetch tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'pending',
          assignee: data.assignee || '',
          project: data.project || null,
          type: data.type || 'feature',
          priority: data.priority ?? 2,
          prLink: data.prLink || null,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        }
      })
      setTasks(taskList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch projects
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('name', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectList = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || '',
          active: data.active !== false,
        }
      })
      setProjects(projectList.filter(p => p.active))
    })
    return () => unsubscribe()
  }, [])

  const handleAddTask = async (values) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...values,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      message.success('Task added!')
      setModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error('Failed to add task')
    }
  }

  const handleAddProject = async (values) => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...values,
        active: true,
        createdAt: new Date().toISOString(),
      })
      message.success('Project added!')
      setProjectModalOpen(false)
      projectForm.resetFields()
    } catch (error) {
      message.error('Failed to add project')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
      message.success('Status updated!')
    } catch (error) {
      message.error('Failed to update status')
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId))
      message.success('Task deleted!')
    } catch (error) {
      message.error('Failed to delete task')
    }
  }

  const handleUpdatePRLink = async (taskId, prLink) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        prLink: prLink,
        updatedAt: new Date().toISOString(),
      })
      message.success('PR link updated!')
    } catch (error) {
      message.error('Failed to update PR link')
    }
  }

  const handleToggleProjectActive = async (projectId, currentActive) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        active: !currentActive,
      })
      message.success(`Project ${currentActive ? 'deactivated' : 'activated'}!`)
    } catch (error) {
      message.error('Failed to update project')
    }
  }

  const getTasksByStatus = (status) => {
    let filtered = tasks.filter(t => t.status === status)
    if (selectedProject) {
      filtered = filtered.filter(t => t.project === selectedProject)
    }
    return filtered
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ fontSize: 24, color: '#00a8ff' }} />
          <span style={{ fontSize: 20, fontWeight: 'bold' }}>AI Todos</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<FolderOutlined />} onClick={() => setProjectModalOpen(true)}>
            Projects
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            New Task
          </Button>
        </div>
      </Header>
      
      <Content style={{ padding: 24 }}>
        {projects.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Select
              style={{ width: 200 }}
              placeholder="Filter by project"
              allowClear
              value={selectedProject}
              onChange={setSelectedProject}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
          </div>
        )}

        <Tabs 
          type="card" 
          items={columns.map(col => ({
            key: col.key,
            label: (
              <span>
                <Tag color={col.color}>{getTasksByStatus(col.key).length}</Tag>
                {col.title}
              </span>
            ),
            children: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {getTasksByStatus(col.key).map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    projects={projects}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onUpdatePRLink={handleUpdatePRLink}
                  />
                ))}
              </div>
            )
          }))}
        />
      </Content>

      <TaskModal 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        onSubmit={handleAddTask}
        projects={projects}
        form={form}
      />

      <ProjectModal 
        open={projectModalOpen}
        onCancel={() => setProjectModalOpen(false)}
        onAddProject={handleAddProject}
        onToggleActive={handleToggleProjectActive}
        projects={projects}
        form={projectForm}
      />
    </Layout>
  )
}

export default App
