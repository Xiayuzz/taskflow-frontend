<template>
  <div class="comment-section">
    <!-- 输入区域 -->
    <div
      v-if="enableCreate"
      class="new-comment"
    >
      <el-input
        v-model="draft"
        type="textarea"
        :rows="3"
        placeholder="发表评论..."
        maxlength="500"
        show-word-limit
      />
      <div class="actions">
        <el-button
          size="small"
          :disabled="submitting || !draft"
          @click="clearDraft"
        >
          清空
        </el-button>
        <el-button
          size="small"
          type="primary"
          :disabled="!draft.trim()"
          :loading="submitting"
          @click="submitRoot"
        >
          发布
        </el-button>
      </div>
    </div>
    <!-- 列表状态 -->
    <el-empty
      v-if="!loading && tree.length === 0"
      description="暂无评论"
    />
    <el-skeleton
      v-else-if="loading && page === 1"
      :rows="3"
      animated
    />
    <!-- 树形评论列表 -->
    <ul
      v-else
      class="comment-list"
    >
      <CommentTreeNode
        v-for="n in tree"
        :key="n.comment.id"
        :node="n"
        :allow-delete="allowDelete"
        :format-time="formatTime"
        @reply="startReply"
        @delete="remove"
      />
    </ul>
    <!-- 加载更多 -->
    <div
      v-if="!loading && hasMore"
      class="load-more"
    >
      <el-button
        text
        type="primary"
        @click="loadMore"
      >
        加载更多
      </el-button>
    </div>
    <div
      v-if="loading && page > 1"
      class="loading-more"
    >
      加载中...
    </div>
    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyVisible"
      title="回复评论"
      width="520px"
      destroy-on-close
    >
      <div
        class="reply-target"
        v-if="replyingTo"
      >
        <div class="reply-user">回复：{{ getCommentUserName(replyingTo) }}</div>
        <div class="reply-content">{{ replyingTo.content }}</div>
      </div>
      <el-input
        v-model="replyDraft"
        type="textarea"
        :rows="4"
        placeholder="输入回复..."
        maxlength="500"
        show-word-limit
      />
      <template #footer>
        <el-button
          :disabled="replySubmitting"
          @click="closeReply"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="replySubmitting"
          :disabled="!replyDraft.trim()"
          @click="submitReply"
        >
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { type Component, computed, defineComponent, h, onMounted, PropType, ref, watch } from 'vue';

import { createComment, deleteComment, fetchComments } from '@/services/commentService';
import { useUserStore } from '@/store/user';
import type { Comment } from '@/types/models';

defineOptions({ name: 'CommentList' });

interface Props {
  taskId: number;
  pageSize?: number;
  enableCreate?: boolean;
}
interface TreeNode {
  comment: Comment;
  children: TreeNode[];
}

const props = defineProps<Props>();
const emit = defineEmits(['loaded', 'created', 'deleted']);

// 基础状态
const flat = ref<Comment[]>([]);
const tree = ref<TreeNode[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const submitting = ref(false);
const draft = ref('');

// 回复状态
const replyVisible = ref(false);
const replyingTo = ref<Comment | null>(null);
const replyDraft = ref('');
const replySubmitting = ref(false);

const userStore = useUserStore();
const pageSize = computed(() => props.pageSize || 10);
const hasMore = computed(() => flat.value.length < total.value);

function buildTree(list: Comment[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  list.forEach((c) => map.set(c.id, { comment: c, children: [] }));
  list.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.children.push(map.get(c.id)!);
    else if (!c.parentId) roots.push(map.get(c.id)!);
  });
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => b.comment.id - a.comment.id);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}
function rebuildTree() {
  tree.value = buildTree(flat.value);
}

function formatTime(t: string) {
  return t.replace('T', ' ').substring(0, 16);
}
function clearDraft() {
  draft.value = '';
}
function allowDelete(c: Comment) {
  return c.userId === userStore.currentUser?.id || userStore.currentUser?.role === 'admin';
}

function getCommentUserName(comment: Comment) {
  return comment.user?.name || comment.user?.username || `用户#${comment.userId}`;
}

async function load(reset = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    if (reset) {
      page.value = 1;
      flat.value = [];
    }
    const res = await fetchComments(props.taskId, { page: page.value, pageSize: pageSize.value });
    total.value = res.total;
    if (page.value === 1) flat.value = res.items;
    else flat.value.push(...res.items);
    rebuildTree();
    emit('loaded', { total: total.value });
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '加载评论失败');
  } finally {
    loading.value = false;
  }
}
function loadMore() {
  if (!hasMore.value) return;
  page.value += 1;
  load();
}

async function submitRoot() {
  if (!draft.value.trim()) return;
  submitting.value = true;
  try {
    const created = await createComment(props.taskId, { content: draft.value.trim() });
    flat.value.unshift(created);
    total.value += 1;
    draft.value = '';
    rebuildTree();
    ElMessage.success('发布成功');
    emit('created', created);
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '发布失败');
  } finally {
    submitting.value = false;
  }
}
function startReply(c: Comment) {
  replyingTo.value = c;
  replyDraft.value = '';
  replyVisible.value = true;
}
function closeReply() {
  replyVisible.value = false;
  replyingTo.value = null;
}
async function submitReply() {
  if (!replyingTo.value || !replyDraft.value.trim()) return;
  replySubmitting.value = true;
  try {
    const created = await createComment(props.taskId, {
      content: replyDraft.value.trim(),
      parentId: replyingTo.value.id,
    });
    flat.value.unshift(created);
    total.value += 1;
    rebuildTree();
    ElMessage.success('回复已发布');
    emit('created', created);
    closeReply();
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '回复失败');
  } finally {
    replySubmitting.value = false;
  }
}
async function remove(id: number) {
  try {
    await deleteComment(id);
    const idx = flat.value.findIndex((c) => c.id === id);
    if (idx >= 0) {
      flat.value.splice(idx, 1);
      total.value -= 1;
      rebuildTree();
    }
    ElMessage.success('已删除');
    emit('deleted', id);
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '删除失败');
  }
}

// 递归节点（使用局部常量，在 render 中可自引用）
const CommentTreeNode: Component = defineComponent({
  name: 'CommentTreeNode',
  props: {
    node: { type: Object as PropType<TreeNode>, required: true },
    allowDelete: { type: Function as PropType<(c: Comment) => boolean>, required: true },
    formatTime: { type: Function as PropType<(t: string) => string>, required: true },
  },
  emits: ['reply', 'delete'],
  setup(p, { emit }) {
    const onReply = () => emit('reply', p.node.comment);
    const onDelete = () => emit('delete', p.node.comment.id);

    // 头像处理逻辑
    const DEFAULT_AVATAR = '/assets/images/default-avatar.png';
    const avatarSrc = ref(p.node.comment.user?.avatar || DEFAULT_AVATAR);

    watch(
      () => p.node.comment.user?.avatar,
      (newVal) => {
        avatarSrc.value = newVal || DEFAULT_AVATAR;
      }
    );

    const handleImageError = () => {
      if (avatarSrc.value !== DEFAULT_AVATAR) {
        avatarSrc.value = DEFAULT_AVATAR;
      }
    };

    return () =>
      h('li', { class: 'comment-item' }, [
        h('div', { class: 'comment-header' }, [
          h('img', {
            class: 'avatar',
            src: avatarSrc.value,
            alt: 'User Avatar',
            onError: handleImageError,
          }),
          h('div', { class: 'comment-meta' }, [
            h('div', { class: 'user-info' }, [
              h(
                'span',
                { class: 'user' },
                getCommentUserName(p.node.comment)
              ),
              h('span', { class: 'time' }, p.formatTime(p.node.comment.createdAt)),
            ]),
            p.node.comment.parentId
              ? h('span', { class: 'parent-tag' }, '回复 #' + p.node.comment.parentId)
              : null,
            h('div', { class: 'actions-inline' }, [
              p.allowDelete(p.node.comment)
                ? h(
                    'el-button',
                    {
                      size: 'small',
                      text: true,
                      type: 'danger',
                      class: 'action-btn delete-btn',
                      onClick: onDelete,
                    },
                    { default: () => '删除' }
                  )
                : null,
              h(
                'el-button',
                {
                  size: 'small',
                  text: true,
                  type: 'primary',
                  class: 'action-btn reply-btn',
                  onClick: onReply,
                },
                { default: () => '回复' }
              ),
            ]),
          ]),
        ]),
        h('div', { class: 'content' }, p.node.comment.content),
        p.node.children.length
          ? h(
              'ul',
              { class: 'children' },
              p.node.children.map((ch) =>
                h(CommentTreeNode, {
                  node: ch,
                  allowDelete: p.allowDelete,
                  formatTime: p.formatTime,
                  onReply: (c: Comment) => emit('reply', c),
                  onDelete: (id: number) => emit('delete', id),
                })
              )
            )
          : null,
      ]);
  },
});

onMounted(() => load(true));
watch(
  () => props.taskId,
  () => load(true)
);
</script>

<style scoped>
.comment-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 新评论输入区域 */
.new-comment {
  background: #f7f9fc;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #eef1f5;
}

.new-comment:hover {
  border-color: #d9e1f2;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.new-comment .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.new-comment .actions .el-button {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.new-comment .actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.new-comment .el-input__inner {
  border-radius: 6px;
  resize: vertical;
  min-height: 80px;
  font-size: 14px;
  line-height: 1.5;
}

/* 评论列表 */
.comment-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 单个评论项 - 必须使用 deep 因为它是内部组件渲染的 */
:deep(.comment-item) {
  background: #fff;
  border: 1px solid #eef1f5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

:deep(.comment-item:hover) {
  border-color: #d9e1f2;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

/* 评论头部 */
:deep(.comment-header) {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  align-items: flex-start;
  position: relative;
}

/* 头像 */
:deep(.avatar) {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid #eef1f5;
  background-color: #f5f7fa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 评论元信息 */
:deep(.comment-meta) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 增加整体元信息之间的间距 */
  min-width: 0;
}

:deep(.user-info) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px; /* 增加用户名和日期之间的间距 */
  margin-bottom: 4px;
}

:deep(.user) {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
  line-height: 1.4;
}

:deep(.time) {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

:deep(.parent-tag) {
  background: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  align-self: flex-start;
  margin-bottom: 4px;
  border: 1px solid #d9ecff;
}

/* 操作按钮 */
:deep(.actions-inline) {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  align-items: center;
}

/* 按钮通用样式 */
:deep(.action-btn) {
  padding: 6px 16px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
  height: 32px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-left: 0 !important;
}

/* 回复按钮样式 */
:deep(.reply-btn) {
  background-color: rgba(64, 158, 255, 0.1) !important;
  color: #409eff !important;
}

:deep(.reply-btn:hover) {
  background-color: #409eff !important;
  color: #fff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.reply-btn:active) {
  transform: translateY(0);
  box-shadow: none;
}

/* 删除按钮样式 */
:deep(.delete-btn) {
  background-color: rgba(245, 108, 108, 0.1) !important;
  color: #f56c6c !important;
}

:deep(.delete-btn:hover) {
  background-color: #f56c6c !important;
  color: #fff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

:deep(.delete-btn:active) {
  transform: translateY(0);
  box-shadow: none;
}

/* 评论内容 */
:deep(.content) {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  margin-top: 8px;
  margin-bottom: 16px;
  margin-left: 62px; /* 50px avatar + 12px gap */
  padding-right: 12px;
}

/* 回复列表 */
:deep(.children) {
  list-style: none;
  margin: 12px 0 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.children .comment-item) {
  border-left: 2px solid #d9e1f2;
  padding-left: 16px;
  margin-left: 4px;
  background: #f9fafc;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 12px;
}

.loading-more {
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding: 12px;
}

/* 回复对话框 */
.reply-target {
  background: #f5f7fa;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  font-size: 13px;
  border-left: 4px solid #409eff;
}

.reply-user {
  font-weight: 500;
  color: #409eff;
  margin-bottom: 4px;
}

.reply-content {
  color: #555;
  line-height: 1.4;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .new-comment {
    padding: 12px;
  }

  :deep(.comment-item) {
    padding: 12px;
  }

  :deep(.comment-header) {
    gap: 8px;
  }

  :deep(.avatar) {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

  :deep(.content) {
    margin-left: 0;
    padding-right: 0;
    margin-top: 12px;
  }

  :deep(.user-info) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  :deep(.children) {
    margin-left: 16px;
  }

  :deep(.children .comment-item) {
    padding-left: 12px;
  }
}

@media (max-width: 480px) {
  .new-comment {
    padding: 10px;
  }

  :deep(.comment-item) {
    padding: 10px;
  }

  :deep(.comment-header) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  :deep(.comment-meta) {
    width: 100%;
  }

  :deep(.children) {
    margin-left: 12px;
  }

  :deep(.children .comment-item) {
    padding-left: 10px;
  }
}
</style>
