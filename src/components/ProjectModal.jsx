import { Modal, Form, Input, Button, List, Switch } from 'antd'

export function ProjectModal({ open, onCancel, onAddProject, onToggleActive, projects, form }) {
  return (
    <Modal
      title="Manage Projects"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form form={form} layout="inline" onFinish={onAddProject} style={{ marginBottom: 16 }}>
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
                onChange={() => onToggleActive(item.id, item.active)}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />,
            ]}
          >
            {item.name}
          </List.Item>
        )}
      />
    </Modal>
  )
}
