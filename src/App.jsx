import { useState, useEffect } from 'react'
import { Layout, Tabs, Card, Button, Modal, Form, Input, Select, Tag, message } from 'antd'
import { PlusOutlined, FireOutlined } from '@ant-design/icons'
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
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTasks(taskList)
      setLoading(false)
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

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FireOutlined style={{ fontSize: 24, color: '#00a8ff' }} />
          <span style={{ fontSize: 20, fontWeight: 'bold' }}>AI Todos</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          New Task
        </Button>
      </Header>
      
      <Content style={{ padding: 24 }}>
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
                      <Select
                        value={task.status}
                        onChange={(val) => handleStatusChange(task.id, val)}
                        style={{ width: 140 }}
                        options={columns.map(c => ({ value: c.key, label: c.title }))}
                      />
                    }
                    actions={[
                      <Button type="text" danger onClick={() => handleDelete(task.id)}>Delete</Button>
                    ]}
                  >
                    <p>{task.description}</p>
                    <Tag>{task.assignee || 'Unassigned'}</Tag>
                  </Card>
                ))}
              </div>
            )
          }))}
        />
      </Content>

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
          <Button type="primary" htmlType="submit" block>
            Add Task
          </Button>
        </Form>
      </Modal>
    </Layout>
  )
}

export default App
