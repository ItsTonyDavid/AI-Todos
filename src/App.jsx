import { useState, useEffect } from 'react'
import { Layout, Tabs, Card, Button, Modal, Form, Input, Select, Tag, message, Switch, List, Dropdown } from 'antd'
import { PlusOutlined, FireOutlined, FolderOutlined, EllipsisOutlined } from '@ant-design/icons'
import { db } from './firebase/config'
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore'

const { Header, Content } = Layout

const columns = [
  { key: 'pending', title: 'Pending', color: '#ffec3d' },
  { key: 'in_progress', title: 'In Progress', color: '#1890ff' },
  { key: 'blocked', title: 'Blocked', color: '#ff4d4f' },
  { key: 'in_review', title: 'In Review', color: '#722ed1' },
  { key: 'done', title: 'Done', color: '#52c41a' },
]

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
          type: data.type || 'feature', // feature, enhance, fix
          priority: data.priority ?? 2, // 0-5, default 2
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
          active: data.active !== false, // default true
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
        {/* Project Filter */}
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
                  <Card 
                    key={task.id} 
                    title={task.title}
                    extra={
                      <Dropdown
                        menu={{
                          items: columns.map(c => ({ 
                            key: c.key, 
                            label: c.title,
                            onClick: () => handleStatusChange(task.id, c.key)
                          }))
                        }}
                        trigger={['click']}
                      >
                        <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 20 }} />} />
                      </Dropdown>
                    }
                    actions={[
                      <Button type="text" danger onClick={() => handleDelete(task.id)}>Delete</Button>
                    ]}
                  >
                    <p>{task.description}</p>
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
                  </Card>
                ))}
              </div>
            )
          }))}
        />
      </Content>

      {/* Add Task Modal */}
      <Modal
        title="Add New Task"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTask}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Task title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Task description" rows={3} />
          </Form.Item>
          <Form.Item name="assignee" label="Assignee" rules={[{ required: true }]}>
            <Select placeholder="Select assignee">
              <Select.Option value="Tony">Tony</Select.Option>
              <Select.Option value="Tron">Tron</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Type" initialValue="feature">
            <Select placeholder="Select type">
              <Select.Option value="feature">✨ Feature</Select.Option>
              <Select.Option value="enhance">🚀 Enhance</Select.Option>
              <Select.Option value="fix">🔧 Fix</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue={2}>
            <Select placeholder="Select priority">
              <Select.Option value={0}>0 - Lowest</Select.Option>
              <Select.Option value={1}>1 - Low</Select.Option>
              <Select.Option value={2}>2 - Medium</Select.Option>
              <Select.Option value={3}>3 - High</Select.Option>
              <Select.Option value={4}>4 - Urgent</Select.Option>
              <Select.Option value={5}>5 - Critical</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="project" label="Project" rules={[{ required: true, message: 'Please select a project' }]}>
            <Select placeholder="Select project">
              {projects.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Add Task
          </Button>
        </Form>
      </Modal>

      {/* Projects Modal */}
      <Modal
        title="Manage Projects"
        open={projectModalOpen}
        onCancel={() => setProjectModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={projectForm} layout="inline" onFinish={handleAddProject} style={{ marginBottom: 16 }}>
          <Form.Item name="name" label="Project Name" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Input placeholder="New project name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add</Button>
          </Form.Item>
        </Form>
        <List
          size="small"
          dataSource={projects}
          renderItem={item => (
            <List.Item
              actions={[
                <Switch 
                  key="active"
                  checked={item.active} 
                  onChange={() => handleToggleProjectActive(item.id, item.active)}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />,
                <Button key="delete" type="text" danger size="small">Delete</Button>
              ]}
            >
              {item.name}
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  )
}

export default App
