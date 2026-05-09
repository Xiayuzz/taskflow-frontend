<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="task-detail">
    <div class="header">
      <h1>{{ task?.title || '任务详情' }}</h1>
      <div class="ops">
        <el-button
          v-if="userStore.isAdmin"
          size="small"
          type="primary"
          :disabled="!task"
          @click="openEdit"
          >编辑</el-button
        >
        <el-button
          v-if="task && (userStore.currentUser?.id === task.assigneeId || isGroupMember)"
          size="small"
          type="success"
          @click="openProgress"
          >汇报进度</el-button
        >
        <el-button
          size="small"
          @click="goList"
          >返回</el-button
        >
      </div>
    </div>

    <el-card
      v-loading="loading"
      shadow="never"
      class="mb-section"
    >
      <template #header>
        <div class="card-head">基础信息</div>
      </template>
      <div
        v-if="task"
        class="info-grid"
      >
        <div>
          <span class="label">状态：</span
          ><el-tag
            :type="statusTag(task.status)"
            size="small"
            >{{ statusText(task.status) }}</el-tag
          >
        </div>
        <div>
          <span class="label">优先级：</span
          ><el-tag
            :type="priorityTag(task.priority)"
            size="small"
            >{{ priorityText(task.priority) }}</el-tag
          >
        </div>
        <div>
          <span class="label">进度：</span
          ><el-progress
            :percentage="task.progress"
            :status="task.progress === 100 ? 'success' : undefined"
            style="width: 160px"
          />
        </div>
        <div><span class="label">指派给：</span>{{ assigneeName || task.assigneeId || '-' }}</div>
        <div><span class="label">创建者：</span>{{ creatorName || task.creatorId || '-' }}</div>
        <div><span class="label">截止：</span>{{ formatDate(task.dueDate) }}</div>
        <div><span class="label">更新时间：</span>{{ formatDate(task.updatedAt) }}</div>
        <div>
          <span class="label">标签：</span>
          <el-tag
            v-for="tag in task.tags || []"
            :key="tag"
            size="small"
            style="margin-left: 4px"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!task.tags || task.tags.length === 0">-</span>
        </div>
        <div><span class="label">预估工时：</span>{{ task.estimatedHours || 0 }} 小时</div>
        <div><span class="label">实际工时：</span>{{ task.actualHours || 0 }} 小时</div>
        <div>
          <span class="label">提醒：</span>
          <span v-if="task.isReminderOn && task.reminderTime">
            {{ formatDate(task.reminderTime) }}
          </span>
          <span v-else>-</span>
        </div>
      </div>
      <el-empty
        v-else
        description="未找到任务"
      />
      <div class="desc">
        <div class="label">描述：</div>
        <div class="body">{{ task?.description || '无' }}</div>
      </div>
    </el-card>

    <el-card
      v-if="userStore.isAdmin"
      shadow="never"
      class="mb-section"
    >
      <template #header>
        <div class="card-head">快速操作</div>
      </template>
      <el-form
        v-if="task"
        label-width="100px"
      >
        <el-form-item label="状态">
          <el-select
            v-model="editModel.status"
            size="small"
            style="width: 160px"
          >
            <el-option
              label="待处理"
              value="pending"
            />
            <el-option
              label="进行中"
              value="in_progress"
            />
            <el-option
              label="已完成"
              value="done"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="editModel.priority"
            size="small"
            style="width: 160px"
          >
            <el-option
              label="低"
              value="low"
            />
            <el-option
              label="中"
              value="medium"
            />
            <el-option
              label="高"
              value="high"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="进度">
          <el-slider
            v-model="editModel.progress"
            :step="5"
            show-input
            style="max-width: 300px"
          />
        </el-form-item>
        <el-form-item label="截止">
          <el-date-picker
            v-model="editModel.dueDate"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="updating"
            @click="submitUpdate"
            >保存</el-button
          >
          <el-button
            :disabled="updating"
            @click="resetEdit"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务分配卡片 -->
    <el-card
      v-if="userStore.isAdmin"
      shadow="never"
      class="mb-section"
    >
      <template #header>
        <div class="card-head">任务分配</div>
      </template>
      <el-form
        v-if="task"
        label-width="100px"
      >
        <el-form-item label="指派给">
          <el-button
            type="primary"
            @click="showAssignUserSelector = true"
          >
            {{ assignedUserName || '选择用户' }}
          </el-button>
        </el-form-item>
        <el-form-item label="通知">
          <el-switch v-model="assignForm.notify" />
        </el-form-item>
        <el-form-item
          v-if="assignForm.notify"
          label="通知消息"
        >
          <el-input
            v-model="assignForm.message"
            type="textarea"
            placeholder="自定义通知消息"
            :rows="2"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="assigning"
            @click="submitAssign"
            >分配</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 附件管理卡片 -->
    <el-card
      shadow="never"
      class="mb-section"
    >
      <template #header>
        <div class="card-head">附件管理</div>
      </template>
      <div v-if="task">
        <div class="attachment-upload-section">
          <el-upload
            ref="uploadRef"
            class="upload-drop-zone"
            :class="{ 'is-dragover': isDragOver }"
            :action="`/api/tasks/${task.id}/attachments`"
            :headers="{ Authorization: `Bearer ${authToken}` }"
            :on-success="handleAttachmentUpload"
            :on-error="handleAttachmentUploadError"
            :on-progress="handleUploadProgress"
            :before-upload="beforeAttachmentUpload"
            :show-file-list="false"
            drag
            multiple
            @dragenter.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="isDragOver = false"
          >
            <div class="upload-content">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip">支持多种格式文件，单个文件大小不超过10MB</div>
            </div>
          </el-upload>

          <!-- 上传进度列表 -->
          <transition-group
            name="list"
            tag="div"
            class="upload-progress-list"
          >
            <div
              v-for="file in uploadingFiles"
              :key="file.uid"
              class="upload-progress-item"
            >
              <div class="file-info">
                <div class="file-name-wrapper">
                  <el-icon><Document /></el-icon>
                  <span
                    class="file-name"
                    :title="file.name"
                    >{{ file.name }}</span
                  >
                </div>
                <span class="upload-status">
                  {{
                    file.status === 'success'
                      ? '上传成功'
                      : file.status === 'fail'
                        ? '上传失败'
                        : '上传中...'
                  }}
                </span>
              </div>
              <el-progress
                :percentage="file.percentage ? Math.floor(file.percentage) : 0"
                :status="
                  file.status === 'success' ? 'success' : file.status === 'fail' ? 'exception' : ''
                "
                :stroke-width="4"
              />
            </div>
          </transition-group>
        </div>

        <el-table
          v-loading="attachmentsLoading"
          :data="attachments"
          style="margin-top: 20px"
          stripe
          size="small"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="80"
          />
          <el-table-column
            label="文件名"
            min-width="200"
          >
            <template #default="{ row }">
              <el-link
                type="primary"
                underline="never"
                @click="downloadAttachment(row)"
              >
                <el-icon><Document /></el-icon> {{ row.originalName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="size"
            label="大小"
            width="100"
          >
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="uploadedAt"
            label="上传时间"
            width="180"
          >
            <template #default="{ row }">
              {{ formatDate(row.uploadedAt) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="uploadedBy"
            label="上传者ID"
            width="100"
          />
          <el-table-column
            prop="description"
            label="描述"
            min-width="150"
          >
            <template #default="{ row }">
              <div class="description-cell">
                <span v-if="row.id !== editingDescriptionId">{{ row.description || '-' }}</span>
                <el-input
                  v-else
                  v-model="editingDescriptionValue"
                  size="small"
                  @blur="submitDescriptionEdit(row)"
                  @keyup.enter="submitDescriptionEdit(row)"
                />
                <el-button
                  v-if="row.id !== editingDescriptionId"
                  link
                  type="primary"
                  size="small"
                  class="edit-icon"
                  @click="startDescriptionEdit(row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="220"
            align="center"
          >
            <template #default="{ row }">
              <div style="display: flex; gap: 8px; justify-content: center">
                <el-button
                  type="primary"
                  size="small"
                  @click="previewAttachment(row)"
                >
                  <el-icon><View /></el-icon> 预览
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="downloadAttachment(row)"
                >
                  <el-icon><Download /></el-icon> 下载
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteAttachment(row.id)"
                >
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="!attachmentsLoading && attachments.length === 0"
          description="暂无附件"
          style="margin-top: 20px"
        />
      </div>
    </el-card>

    <!-- 提醒管理卡片 -->
    <el-card
      shadow="never"
      class="mb-section"
    >
      <template #header>
        <div class="card-head">提醒管理</div>
      </template>
      <div v-if="task">
        <el-button
          type="primary"
          size="small"
          @click="showAddReminderDialog"
          >添加提醒</el-button
        >
        <el-table
          v-loading="remindersLoading"
          :data="reminders"
          style="margin-top: 16px"
          stripe
          size="small"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="80"
          />
          <el-table-column
            prop="userId"
            label="用户ID"
            width="100"
          />
          <el-table-column
            prop="reminderType"
            label="提醒类型"
            width="120"
          >
            <template #default="{ row }">
              {{ reminderTypeText(row.reminderType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="reminderTime"
            label="提醒时间"
            width="200"
          >
            <template #default="{ row }">
              {{ formatDate(row.reminderTime) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="reminderStatusTag(row.status)"
                size="small"
              >
                {{ reminderStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="120"
          >
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="deleteReminder(row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="!remindersLoading && reminders.length === 0"
          description="暂无提醒"
          style="margin-top: 20px"
        />
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-head">评论</div>
      </template>
      <CommentList
        v-if="task"
        :task-id="task.id"
        enable-create
        @created="onCommentCreated"
      />
      <el-skeleton
        v-else
        :rows="3"
        animated
      />
    </el-card>

    <el-dialog
      v-model="editVisible"
      title="编辑任务"
      width="600px"
      destroy-on-close
    >
      <el-form
        v-if="task"
        label-width="100px"
      >
        <el-form-item label="标题">
          <el-input v-model="editModel.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editModel.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editModel.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input
            v-model="editModel.estimatedHours"
            type="number"
            placeholder="小时"
            min="0"
          />
        </el-form-item>
        <el-form-item label="实际工时">
          <el-input
            v-model="editModel.actualHours"
            type="number"
            placeholder="小时"
            min="0"
          />
        </el-form-item>
        <el-form-item label="提醒设置">
          <el-switch v-model="editModel.isReminderOn" />
        </el-form-item>
        <el-form-item
          label="提醒时间"
          v-if="editModel.isReminderOn"
        >
          <el-date-picker
            v-model="editModel.reminderTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            placeholder="选择提醒时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="updating"
          @click="submitUpdate"
          >保存</el-button
        >
      </template>
    </el-dialog>

    <!-- 添加提醒对话框 -->
    <el-dialog
      v-model="addReminderVisible"
      title="添加提醒"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="addReminderForm"
        label-width="100px"
      >
        <el-form-item label="用户">
          <el-button
            type="primary"
            @click="showReminderUserSelector = true"
          >
            {{ reminderUserName || '选择用户' }}
          </el-button>
        </el-form-item>
        <el-form-item label="提醒类型">
          <el-select v-model="addReminderForm.reminderType">
            <el-option
              label="邮件"
              value="email"
            />
            <el-option
              label="短信"
              value="sms"
            />
            <el-option
              label="站内信"
              value="in_app"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒时间">
          <el-date-picker
            v-model="addReminderForm.reminderTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss[Z]"
            placeholder="选择提醒时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addReminderVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="addingReminder"
          @click="submitAddReminder"
          >添加</el-button
        >
      </template>
    </el-dialog>

    <UserSelector
      v-model="showAssignUserSelector"
      @select="handleAssignUserSelect"
    />

    <UserSelector
      v-model="showReminderUserSelector"
      @select="handleReminderUserSelect"
    />

    <!-- 附件预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="`预览附件：${previewAttachmentName}`"
      width="80%"
      destroy-on-close
      append-to-body
    >
      <div
        v-if="previewLoading"
        style="text-align: center; padding: 40px"
      >
        <el-icon class="is-loading"><Loading /></el-icon>
        <span style="margin-left: 10px">加载中...</span>
      </div>
      <div
        v-else-if="previewError"
        style="text-align: center; padding: 40px; color: #f56c6c"
      >
        <el-icon><Warning /></el-icon>
        <span style="margin-left: 10px">{{ previewError }}</span>
      </div>
      <div v-else>
        <!-- 图片预览 -->
        <div
          v-if="previewType === 'image'"
          class="preview-image-container"
        >
          <img
            :src="previewUrl"
            alt="预览图片"
            class="preview-image"
          />
        </div>
        <!-- PDF预览 -->
        <div
          v-else-if="previewType === 'pdf'"
          class="preview-pdf-container"
        >
          <iframe
            :src="previewUrl"
            class="preview-pdf"
            frameborder="0"
          ></iframe>
        </div>
        <!-- Markdown预览 -->
        <div
          v-else-if="previewType === 'markdown'"
          class="preview-markdown-container"
        >
          <div
            v-html="previewContent"
            class="preview-markdown"
          ></div>
        </div>
        <!-- 不支持的文件类型 -->
        <div
          v-else
          style="text-align: center; padding: 40px"
        >
          <el-icon><Document /></el-icon>
          <p style="margin-top: 10px">不支持预览此文件类型</p>
          <el-button
            type="primary"
            size="small"
            @click="previewingAttachment && downloadAttachment(previewingAttachment)"
          >
            <el-icon><Download /></el-icon> 下载文件
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="previewingAttachment && downloadAttachment(previewingAttachment)"
        >
          <el-icon><Download /></el-icon> 下载
        </el-button>
      </template>
    </el-dialog>

    <!-- 进度汇报对话框 -->
    <el-dialog
      v-model="progressVisible"
      title="汇报进度与工时"
      width="500px"
      destroy-on-close
    >
      <el-form
        :model="progressForm"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item
          label="完成进度"
          required
        >
          <el-slider
            v-model="progressForm.progress"
            :step="1"
            :min="0"
            :max="100"
            show-input
          />
        </el-form-item>
        <el-form-item
          label="实际工时"
          required
        >
          <el-input-number
            v-model="progressForm.actualHours"
            :min="0"
            :precision="1"
            :step="0.5"
            placeholder="请输入工时"
          />
          <span class="ml-2">小时</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="progressForm.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="可选备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submittingProgress"
          @click="submitProgress"
          >提交</el-button
        >
      </template>
    </el-dialog>

    <!-- 用户选择器 -->
    <UserSelector
      v-model="showAssignUserSelector"
      @select="handleAssignUserSelect"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Delete,
  Document,
  Download,
  Edit,
  Loading,
  UploadFilled,
  View,
  Warning,
} from '@element-plus/icons-vue';
import { ElMessage, ElUpload } from 'element-plus';
import { defineAsyncComponent, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import UserSelector from '@/components/UserSelector.vue';
import {
  deleteAttachment as deleteAttachmentApi,
  downloadAttachment as downloadAttachmentApi,
  getTaskAttachments,
  updateAttachmentDescription,
} from '@/services/attachmentService';
import { getGroupMembers } from '@/services/groupService';
import {
  assignTask,
  createTaskReminder,
  deleteTaskReminder,
  fetchTaskReminders,
  fetchTaskTags,
  getTask,
  submitTaskProgress,
  updateTask,
} from '@/services/taskService';
import { getUserById } from '@/services/userService';
import { useUserStore } from '@/store/user';
const CommentList = defineAsyncComponent(() => import('@/components/CommentList.vue'));

import type {
  Task,
  TaskAttachment,
  TaskPriority,
  TaskReminder,
  TaskStatus,
  User,
} from '@/types/models';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const task = ref<Task | null>(null);
const loading = ref(false);
const updating = ref(false);
const editVisible = ref(false);

const isGroupMember = ref(false);
const progressVisible = ref(false);
const submittingProgress = ref(false);
const progressForm = reactive({
  progress: 0,
  actualHours: 0,
  remark: '',
});

const assigneeName = ref('');
const creatorName = ref('');

// 获取认证token
const authToken = ref<string | null>(window.localStorage.getItem('token'));

// 可用标签
const availableTags = ref<{ name: string; color: string }[]>([]);

// 用户选择器相关
const showAssignUserSelector = ref(false);
const assignedUserName = ref('');

function handleAssignUserSelect(user: User) {
  assignForm.assigneeId = user.id;
  assignedUserName.value = user.username;
  showAssignUserSelector.value = false;
}

// 提醒用户选择器相关
const showReminderUserSelector = ref(false);
const reminderUserName = ref('');

function handleReminderUserSelect(user: User) {
  addReminderForm.userId = user.id;
  reminderUserName.value = user.name || user.username;
  showReminderUserSelector.value = false;
}

// 任务分配相关
const assigning = ref(false);
const assignForm = reactive({
  assigneeId: 0,
  notify: false,
  message: '',
});

// 提醒管理相关
const reminders = ref<TaskReminder[]>([]);
const remindersLoading = ref(false);
const addReminderVisible = ref(false);
const addingReminder = ref(false);
const addReminderForm = reactive({
  userId: 0,
  reminderType: 'email' as 'email' | 'sms' | 'in_app',
  reminderTime: '',
});

// 附件管理相关
const attachments = ref<TaskAttachment[]>([]);
const attachmentsLoading = ref(false);
const uploadRef = ref<any>(null);
const uploadingFiles = ref<any[]>([]);
const isDragOver = ref(false);

// 描述编辑相关
const editingDescriptionId = ref<number | null>(null);
const editingDescriptionValue = ref('');

// 预览相关
const previewVisible = ref(false);
const previewLoading = ref(false);
const previewError = ref('');
const previewUrl = ref('');
const previewContent = ref('');
const previewType = ref<'image' | 'pdf' | 'markdown' | 'other'>('other');
const previewAttachmentName = ref('');
const previewingAttachment = ref<TaskAttachment | null>(null);

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理上传进度
function handleUploadProgress(event: any, file: any, fileList: any[]) {
  uploadingFiles.value = [...fileList];
}

// 处理附件上传前的验证
function beforeAttachmentUpload(file: File): boolean {
  // 检查文件大小（10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('单个文件大小不能超过10MB');
    return false;
  }
  // 检查文件是否为空
  if (file.size === 0) {
    ElMessage.error('文件内容不能为空');
    return false;
  }
  return true;
}

// 处理附件上传成功
function handleAttachmentUpload(response: any, file: any, fileList: any[]) {
  ElMessage.success(`文件 ${file.name} 上传成功`);
  loadAttachments();

  // 更新列表状态
  uploadingFiles.value = [...fileList];

  // 3秒后移除成功项
  setTimeout(() => {
    if (uploadRef.value) {
      uploadRef.value.handleRemove(file);
    }
    uploadingFiles.value = uploadingFiles.value.filter((f) => f.uid !== file.uid);
  }, 3000);
}

// 处理附件上传失败
function handleAttachmentUploadError(error: any, file: any, fileList: any[]) {
  ElMessage.error(`文件 ${file.name} 上传失败`);
  console.error('Attachment upload error:', error);

  uploadingFiles.value = [...fileList];

  // 5秒后移除失败项
  setTimeout(() => {
    if (uploadRef.value) {
      uploadRef.value.handleRemove(file);
    }
    uploadingFiles.value = uploadingFiles.value.filter((f) => f.uid !== file.uid);
  }, 5000);
}

// 下载附件
async function downloadAttachment(attachment: TaskAttachment) {
  try {
    const blob = await downloadAttachmentApi(attachment.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    ElMessage.success('附件下载成功');
  } catch (error) {
    ElMessage.error('附件下载失败');
    console.error('Attachment download error:', error);
  }
}

// 删除附件
async function deleteAttachment(attachmentId: number) {
  try {
    await deleteAttachmentApi(attachmentId);
    ElMessage.success('附件删除成功');
    loadAttachments();
  } catch (error) {
    ElMessage.error('附件删除失败');
    console.error('Attachment delete error:', error);
  }
}

// 开始编辑描述
function startDescriptionEdit(row: TaskAttachment) {
  editingDescriptionId.value = row.id;
  editingDescriptionValue.value = row.description || '';
}

// 提交描述编辑
// 由于后端没有专门的更新附件接口，这里假设后端支持或需要实现
// 如果后端没有updateAttachment接口，这里可能需要后端配合添加，或者使用重新上传的方式（不太合理）
// 既然是前端任务，我先添加一个TODO注释，并尝试调用可能存在的update接口或提示
// 检查services/attachmentService.ts发现没有updateAttachment，暂时无法真正提交到后端
// 为了满足用户需求，我需要修改attachmentService.ts添加updateAttachment方法
// 这里先实现逻辑，稍后去修改service
async function submitDescriptionEdit(row: TaskAttachment) {
  if (editingDescriptionId.value === null) return;

  if (editingDescriptionValue.value === row.description) {
    editingDescriptionId.value = null;
    return;
  }

  try {
    // 动态导入避免循环依赖问题（如果存在），或者直接使用
    // 注意：需要去实现 updateAttachment API
    await updateAttachmentDescription(row.id, editingDescriptionValue.value);
    row.description = editingDescriptionValue.value;
    ElMessage.success('描述更新成功');
  } catch (error) {
    ElMessage.error('描述更新失败');
    console.error('Update description error:', error);
  } finally {
    editingDescriptionId.value = null;
  }
}

// 预览附件
async function previewAttachment(attachment: TaskAttachment) {
  previewVisible.value = true;
  previewLoading.value = true;
  previewError.value = '';
  previewAttachmentName.value = attachment.originalName;
  previewingAttachment.value = attachment;

  try {
    // 确定文件类型
    const fileName = attachment.originalName.toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
      previewType.value = 'image';
      const blob = await downloadAttachmentApi(attachment.id);
      previewUrl.value = window.URL.createObjectURL(blob);
    } else if (fileName.endsWith('.pdf')) {
      previewType.value = 'pdf';
      const blob = await downloadAttachmentApi(attachment.id);
      previewUrl.value = window.URL.createObjectURL(blob);
    } else if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
      previewType.value = 'markdown';
      const blob = await downloadAttachmentApi(attachment.id);
      const text = await blob.text();
      previewContent.value = markdownToHtml(text);
    } else {
      previewType.value = 'other';
    }
  } catch (error) {
    console.error('Preview attachment error:', error);
    previewError.value = '预览失败，请尝试下载查看';
  } finally {
    previewLoading.value = false;
  }
}

// Markdown转HTML的简单实现
function markdownToHtml(markdown: string): string {
  const html = markdown
    // 标题
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    // 粗体和斜体
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // 链接
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // 代码块
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // 列表
    .replace(/^\s*\*\s(.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/^\s*\d+\.\s(.*$)/gim, '<ol><li>$1</li></ol>')
    .replace(/<\/ol>\s*<ol>/gim, '')
    // 换行
    .replace(/\n/gim, '<br>');

  // 清理HTML，防止XSS攻击
  return sanitizeHtml(html);
}

// 简单的HTML清理函数，防止XSS攻击
function sanitizeHtml(html: string): string {
  return (
    html
      // 移除<script>标签
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      // 移除危险的属性
      .replace(/<([a-z][a-z0-9]*)[^>]*?(on\w+)="[^"]*"[^>]*>/gi, '<$1>')
      // 保留安全的标签
      .replace(/<(?!h[1-3]|p|br|ul|ol|li|strong|em|code|pre|a)[^>]*>/gi, '')
      .replace(/<\/(?!h[1-3]|p|br|ul|ol|li|strong|em|code|pre|a)[^>]*>/gi, '')
  );
}

// 加载附件列表
async function loadAttachments() {
  if (!task.value) return;

  attachmentsLoading.value = true;
  try {
    attachments.value = await getTaskAttachments(task.value.id);
  } catch (error) {
    ElMessage.error('加载附件失败');
    console.error('Load attachments error:', error);
  } finally {
    attachmentsLoading.value = false;
  }
}

const editModel = reactive<{
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  dueDate?: string | null;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  isReminderOn?: boolean;
  reminderTime?: string | null;
}>({});

// 打开进度汇报
function openProgress() {
  if (!task.value) return;
  progressForm.progress = task.value.progress || 0;
  progressForm.actualHours = task.value.actualHours || 0;
  progressForm.remark = '';
  progressVisible.value = true;
}

// 提交进度
async function submitProgress() {
  if (!task.value) return;

  if (progressForm.progress < 0 || progressForm.progress > 100) {
    ElMessage.warning('进度必须在 0-100 之间');
    return;
  }
  if (progressForm.actualHours < 0) {
    ElMessage.warning('实际工时不能小于 0');
    return;
  }

  submittingProgress.value = true;
  try {
    const updated = await submitTaskProgress(task.value.id, {
      progress: progressForm.progress,
      actualHours: progressForm.actualHours,
      remark: progressForm.remark,
    });
    task.value = updated;
    // 同时更新编辑模型中的数据
    editModel.progress = updated.progress;
    editModel.actualHours = updated.actualHours;

    progressVisible.value = false;
    ElMessage.success('进度汇报成功');
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '提交失败');
  } finally {
    submittingProgress.value = false;
  }
}

// 初始化编辑模型
function mapIntoEdit() {
  if (!task.value) return;
  editModel.title = task.value.title;
  editModel.description = task.value.description;
  editModel.status = task.value.status;
  editModel.priority = task.value.priority;
  editModel.progress = task.value.progress;
  editModel.dueDate = task.value.dueDate || null;
  editModel.tags = task.value.tags || [];
  editModel.estimatedHours = task.value.estimatedHours;
  editModel.actualHours = task.value.actualHours;
  editModel.isReminderOn = task.value.isReminderOn || false;
  editModel.reminderTime = task.value.reminderTime || null;
}

// 重置编辑模型
function resetEdit() {
  mapIntoEdit();
}

// 打开编辑对话框
function openEdit() {
  editVisible.value = true;
  mapIntoEdit();
}

// 返回任务列表
function goList() {
  router.push('/tasks');
}

// 状态标签样式
function statusTag(s: TaskStatus) {
  return s === 'done' ? 'success' : s === 'in_progress' ? 'warning' : 'info';
}

// 状态文本
function statusText(s: TaskStatus) {
  return s === 'pending' ? '待处理' : s === 'in_progress' ? '进行中' : '已完成';
}

// 优先级标签样式
function priorityTag(p: TaskPriority) {
  return p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'info';
}

// 优先级文本
function priorityText(p: TaskPriority) {
  return p === 'high' ? '高' : p === 'medium' ? '中' : '低';
}

// 提醒类型文本
function reminderTypeText(type: string) {
  const map = {
    email: '邮件',
    sms: '短信',
    in_app: '站内信',
  };
  return map[type as keyof typeof map] || type;
}

// 提醒状态标签样式
function reminderStatusTag(status: string): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  const map = {
    pending: 'info',
    sent: 'success',
    failed: 'danger',
  };
  return (map[status as keyof typeof map] || 'info') as
    | 'success'
    | 'warning'
    | 'info'
    | 'danger'
    | 'primary';
}

// 提醒状态文本
function reminderStatusText(status: string) {
  const map = {
    pending: '待发送',
    sent: '已发送',
    failed: '发送失败',
  };
  return map[status as keyof typeof map] || status;
}

// 日期格式化
function formatDate(d?: string | null) {
  return d ? d.replace('T', ' ').substring(0, 16) : '-';
}

// 获取任务详情
async function fetchDetail() {
  const id = Number(route.params.id);
  if (!id) return;
  loading.value = true;
  try {
    task.value = await getTask(id);
    mapIntoEdit();

    // 检查群组权限
    if (task.value && task.value.groupId && userStore.currentUser) {
      try {
        const groupId = Number(task.value.groupId);
        const members = await getGroupMembers(groupId);
        isGroupMember.value = members.some((m) => m.userId === userStore.currentUser?.id);
      } catch (e) {
        console.error('Failed to fetch group members', e);
      }
    }

    // 获取相关用户信息
    if (task.value) {
      if (task.value.assigneeId) {
        getUserById(task.value.assigneeId)
          .then((u: User) => {
            assigneeName.value = u.name || u.username;
          })
          .catch(() => {});
      }
      if (task.value.creatorId) {
        getUserById(task.value.creatorId)
          .then((u: User) => {
            creatorName.value = u.name || u.username;
          })
          .catch(() => {});
      }
    }

    await fetchRemindersList(id);
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '获取任务失败');
  } finally {
    loading.value = false;
  }
}

// 获取标签列表
async function fetchTags() {
  try {
    const tags = await fetchTaskTags();
    availableTags.value = tags;
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '获取标签失败');
  }
}

// 获取提醒列表
async function fetchRemindersList(taskId: number) {
  remindersLoading.value = true;
  try {
    const response = await fetchTaskReminders(taskId);
    reminders.value = response;
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '获取提醒失败');
  } finally {
    remindersLoading.value = false;
  }
}

// 提交任务更新
async function submitUpdate() {
  if (!task.value) return;
  updating.value = true;
  try {
    const updated = await updateTask(task.value.id, {
      title: editModel.title,
      description: editModel.description,
      status: editModel.status,
      priority: editModel.priority,
      progress: editModel.progress,
      dueDate: editModel.dueDate || undefined,
      tags: editModel.tags,
      estimatedHours: editModel.estimatedHours ? Number(editModel.estimatedHours) : undefined,
      actualHours: editModel.actualHours ? Number(editModel.actualHours) : undefined,
      isReminderOn: editModel.isReminderOn,
      reminderTime: editModel.reminderTime || undefined,
    });
    task.value = updated;
    editVisible.value = false;
    ElMessage.success('保存成功');
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '保存失败');
  } finally {
    updating.value = false;
  }
}

// 提交任务分配
async function submitAssign() {
  if (!task.value || !assignForm.assigneeId) {
    ElMessage.warning('请输入有效的用户ID');
    return;
  }
  assigning.value = true;
  try {
    const updated = await assignTask(task.value.id, {
      assigneeId: assignForm.assigneeId,
      notify: assignForm.notify,
      message: assignForm.message,
    });
    task.value = updated;
    ElMessage.success('任务已分配');
    // 重置分配表单
    assignForm.assigneeId = 0;
    assignForm.notify = false;
    assignForm.message = '';
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '分配失败');
  } finally {
    assigning.value = false;
  }
}

// 显示添加提醒对话框
function showAddReminderDialog() {
  addReminderVisible.value = true;
  addReminderForm.userId = 0;
  addReminderForm.reminderType = 'email';
  addReminderForm.reminderTime = '';
  reminderUserName.value = '';
}

// 提交添加提醒
async function submitAddReminder() {
  if (!task.value || !addReminderForm.userId || !addReminderForm.reminderTime) {
    ElMessage.warning('请填写完整的提醒信息');
    return;
  }
  addingReminder.value = true;
  try {
    await createTaskReminder(task.value.id, {
      userId: addReminderForm.userId,
      reminderType: addReminderForm.reminderType,
      // eslint-disable-next-line prettier/prettier
      reminderTime: addReminderForm.reminderTime
    });
    addReminderVisible.value = false;
    await fetchRemindersList(task.value.id);
    ElMessage.success('提醒已添加');
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '添加提醒失败');
  } finally {
    addingReminder.value = false;
  }
}

// 删除提醒
async function deleteReminder(reminderId: number) {
  if (!task.value) return;
  try {
    await deleteTaskReminder(reminderId);
    await fetchRemindersList(task.value.id);
    ElMessage.success('提醒已删除');
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '删除提醒失败');
  }
}

// 初始化
onMounted(async () => {
  await fetchTags();
  await fetchDetail();
  loadAttachments();
});

function onCommentCreated() {
  // 可选：刷新任务更新时间 / 或触发其他逻辑
  // 目前不重新获取任务，若后端返回任务的 lastCommentAt 可在此更新
}
</script>

<style scoped>
.task-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.ops {
  display: flex;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  font-size: 13px;
}

.label {
  color: #666;
  margin-right: 4px;
}

.desc {
  margin-top: 16px;
  font-size: 14px;
}

.desc .body {
  background: #f7f9fc;
  padding: 10px 12px;
  border-radius: 6px;
  white-space: pre-wrap;
}

.card-head {
  font-weight: 600;
}

.mb-section {
  margin-bottom: 8px;
}

.attachment-upload-section {
  margin-bottom: 20px;
}

.attachment-upload-section :deep(.el-upload--drag) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  padding: 30px 20px;
}

.attachment-upload-section :deep(.el-upload--drag:hover) {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.attachment-upload-section :deep(.el-upload--drag.is-dragover) {
  border-color: #409eff;
  background-color: #ecf5ff;
}

/* 优化上传图标和文字 */
.attachment-upload-section :deep(.el-upload-dragger) {
  text-align: center;
}

.attachment-upload-section :deep(.el-icon--upload) {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 10px;
}

.attachment-upload-section :deep(.el-upload__text) {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.attachment-upload-section :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
  cursor: pointer;
}

.attachment-upload-section :deep(.el-upload__tip) {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

/* 优化上传按钮 */
.attachment-upload-section .el-button {
  margin-top: 15px;
}

/* 优化文件列表 */
.attachment-upload-section :deep(.el-upload-list--text) {
  margin-top: 15px;
  width: 100%;
}

.attachment-upload-section :deep(.el-upload-list__item) {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.attachment-upload-section :deep(.el-upload-list__item:hover) {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.attachment-upload-section :deep(.el-upload-list__item-name) {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  margin-right: 12px;
  word-break: break-all;
}

.attachment-upload-section :deep(.el-upload-list__item-status-label) {
  font-size: 12px;
  font-weight: 500;
}

.attachment-upload-section :deep(.el-upload-list__item-status-label.success) {
  color: #67c23a;
}

.attachment-upload-section :deep(.el-upload-list__item-status-label.error) {
  color: #f56c6c;
}

/* 优化上传按钮区域 */
.attachment-upload-section {
  position: relative;
}

.attachment-upload-section .upload-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

/* 优化上传按钮样式 */
.attachment-upload-section .el-button {
  margin-top: 0;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.attachment-upload-section .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.attachment-upload-section .el-button:active {
  transform: translateY(0);
}

/* 优化拖拽区域内部布局 */
.attachment-upload-section :deep(.el-upload-dragger) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* 强制隐藏原生文件输入框 */
.attachment-upload-section :deep(.el-upload__input) {
  display: none !important;
}

/* 增强响应式设计 */
@media (max-width: 768px) {
  .attachment-upload-section :deep(.el-upload--drag) {
    padding: 20px 15px;
    min-height: 160px;
  }

  .attachment-upload-section :deep(.el-icon--upload) {
    font-size: 28px;
  }

  .attachment-upload-section :deep(.el-upload__text) {
    font-size: 13px;
  }

  .attachment-upload-section .upload-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .attachment-upload-section .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .attachment-upload-section :deep(.el-upload--drag) {
    padding: 15px 10px;
    min-height: 140px;
  }

  .attachment-upload-section :deep(.el-icon--upload) {
    font-size: 24px;
  }

  .attachment-upload-section :deep(.el-upload__text) {
    font-size: 12px;
  }

  .attachment-upload-section :deep(.el-upload__tip) {
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .task-detail {
    padding: 1rem;
    gap: 1rem;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .header h1 {
    font-size: 1.25rem;
  }
  .ops {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .info-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
    font-size: 12px;
  }
  .desc {
    margin-top: 1rem;
  }
  .desc .body {
    padding: 0.75rem;
    font-size: 12px;
  }
  .card-head {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .task-detail {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .header h1 {
    font-size: 1.125rem;
  }
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    font-size: 11px;
  }
  .desc .body {
    padding: 0.5rem;
    font-size: 11px;
  }
  .card-head {
    font-size: 0.875rem;
  }
}

/* 预览相关样式 */
.preview-image-container {
  text-align: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.preview-pdf-container {
  width: 100%;
  height: 70vh;
  overflow: hidden;
}

.preview-pdf {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.preview-markdown-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  background-color: #f7f9fc;
  border-radius: 4px;
}

.preview-markdown {
  line-height: 1.6;
}

.preview-markdown h1,
.preview-markdown h2,
.preview-markdown h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-weight: 600;
}

.preview-markdown h1 {
  font-size: 24px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
}

.preview-markdown h2 {
  font-size: 20px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 6px;
}

.preview-markdown h3 {
  font-size: 18px;
}

.preview-markdown p {
  margin-bottom: 10px;
}

.preview-markdown ul,
.preview-markdown ol {
  margin-bottom: 10px;
  padding-left: 20px;
}

.preview-markdown li {
  margin-bottom: 5px;
}

.preview-markdown code {
  background-color: #f6f8fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

.preview-markdown pre {
  background-color: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 10px;
}

.preview-markdown pre code {
  background-color: transparent;
  padding: 0;
}

.preview-markdown a {
  color: #409eff;
  text-decoration: none;
}

.preview-markdown a:hover {
  text-decoration: underline;
}

/* 按钮样式优化 */
.attachment-upload-section .el-button {
  margin-top: 0;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.attachment-upload-section .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.attachment-upload-section .el-button:active {
  transform: translateY(0);
}

/* 表格操作按钮样式 */
:deep(.el-table .el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-table .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-table .el-button .el-icon) {
  font-size: 14px;
}

/* 描述编辑样式 */
.description-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.description-cell .edit-icon {
  opacity: 0;
  transition: opacity 0.2s;
}

.description-cell:hover .edit-icon {
  opacity: 1;
}

/* 按钮大小调整 */
:deep(.el-table .el-button--small) {
  padding: 6px 10px;
  font-size: 12px;
}

/* 上传进度列表样式 */
.upload-progress-list {
  margin-top: 15px;
}

.upload-progress-item {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.file-name-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  flex: 1;
  overflow: hidden;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-status {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
