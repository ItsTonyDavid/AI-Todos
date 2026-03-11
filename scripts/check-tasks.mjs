#!/usr/bin/env node
// Check Firestore for pending tasks assigned to Tron
// Run during heartbeat to get tasks and start working on them

const PROJECT_ID = 'tron-ai-489914';
const DATABASE = 'tron-todos-db';

async function checkForNewTasks() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/tasks?pageSize=50`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.documents) {
      console.log('HEARTBEAT_OK - No tasks found');
      return [];
    }
    
    const tasks = data.documents.map(doc => {
      const fields = doc.fields || {};
      return {
        id: doc.name.split('/').pop(),
        title: fields.title?.stringValue || '',
        description: fields.description?.stringValue || '',
        status: fields.status?.stringValue || '',
        assignee: fields.assignee?.stringValue || '',
        type: fields.type?.stringValue || 'feature',
        project: fields.project?.stringValue || null,
        createdAt: fields.createdAt?.timestampValue || ''
      };
    });
    
    // Filter for Tron and pending
    const pendingTasks = tasks.filter(t => 
      t.assignee === 'Tron' && t.status === 'pending'
    );
    
    if (pendingTasks.length > 0) {
      console.log(`\n🎯 FOUND ${pendingTasks.length} PENDING TASK(S) FOR TRON:\n`);
      pendingTasks.forEach((t, i) => {
        console.log(`${i + 1}. [${t.type.toUpperCase()}] ${t.title}`);
        console.log(`   Description: ${t.description}`);
        console.log(`   ID: ${t.id}`);
        console.log('');
      });
      console.log(`\nTo start working, update status to "in_progress" using:`);
      console.log(`curl -X PATCH "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE}/documents/tasks/{taskId}?updateMask.fieldPaths=status" -H "Content-Type: application/json" -d '{"fields": {"status": {"stringValue": "in_progress"}}}'`);
    } else {
      console.log('HEARTBEAT_OK - No pending tasks for Tron');
    }
    
    return pendingTasks;
  } catch (error) {
    console.error('Error checking tasks:', error.message);
    return [];
  }
}

checkForNewTasks();
