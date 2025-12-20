import request from '../utils/request'

// Social & DM
export const getConversations = () => {
  return request({
    url: '/social/dms',
    method: 'get'
  })
}

export const getMessages = (userId: string) => {
  return request({
    url: `/social/dms/${userId}`,
    method: 'get'
  })
}

export const sendMessage = (data: { receiverId: string; content: string }) => {
  return request({
    url: '/social/dms',
    method: 'post',
    data
  })
}

export const followUser = (userId: string) => {
  return request({
    url: `/social/follow/${userId}`,
    method: 'post'
  })
}

export const unfollowUser = (userId: string) => {
  return request({
    url: `/social/follow/${userId}`,
    method: 'delete'
  })
}

export const getFollowers = (userId: string) => {
  return request({
    url: `/social/followers/${userId}`,
    method: 'get'
  })
}

export const getFollowing = (userId: string) => {
  return request({
    url: `/social/following/${userId}`,
    method: 'get'
  })
}

// Forum
export const getPosts = (boardId?: string) => {
  return request({
    url: '/social/forum/posts',
    method: 'get',
    params: { boardId }
  })
}

export const createPost = (data: { title: string; content: string; boardId: string }) => {
  return request({
    url: '/social/forum/posts',
    method: 'post',
    data
  })
}

export const getPostDetail = (id: string) => {
  return request({
    url: `/social/forum/posts/${id}`,
    method: 'get'
  })
}

export const replyPost = (id: string, content: string) => {
  return request({
    url: `/social/forum/posts/${id}/reply`,
    method: 'post',
    data: { content }
  })
}
