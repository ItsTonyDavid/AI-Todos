import { Modal, Form, Input, Select, Button } from 'antd'

export function TaskModal({ open, onCancel, onSubmit, projects, form }) {
  return (
    <Modal
      title="Add New Task"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
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
  )
}
