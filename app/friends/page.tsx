'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient, Profile } from '@/lib/supabase';

interface Friend {
  id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend_profile?: Profile;
}

interface FriendRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  requester_profile?: Profile;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [message, setMessage] = useState('');

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 친구 목록 로드
  const loadFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (!error && data) {
      // 친구 프로필 가져오기
      const friendIds = data.map((f) => f.friend_id);
      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', friendIds);

        const friendsWithProfiles = data.map((f) => ({
          ...f,
          friend_profile: profiles?.find((p) => p.id === f.friend_id),
        }));
        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }
    }
  };

  // 친구 요청 목록 로드
  const loadFriendRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (!error && data) {
      // 요청자 프로필 가져오기
      const requesterIds = data.map((r) => r.user_id);
      if (requesterIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', requesterIds);

        const requestsWithProfiles = data.map((r) => ({
          ...r,
          requester_profile: profiles?.find((p) => p.id === r.user_id),
        }));
        setFriendRequests(requestsWithProfiles);
      } else {
        setFriendRequests([]);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  // 사용자 검색
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${searchQuery}%`)
      .neq('id', user?.id)
      .limit(10);

    setIsSearching(false);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  // 친구 요청 보내기
  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    // 이미 친구인지 확인
    const existingFriend = friends.find((f) => f.friend_id === friendId);
    if (existingFriend) {
      setMessage('이미 친구입니다.');
      return;
    }

    const { error } = await supabase.from('friendships').insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending',
    });

    if (error) {
      if (error.code === '23505') {
        setMessage('이미 친구 요청을 보냈습니다.');
      } else {
        setMessage('요청 실패: ' + error.message);
      }
    } else {
      setMessage('친구 요청을 보냈습니다.');
      setSearchResults((prev) => prev.filter((p) => p.id !== friendId));
    }

    setTimeout(() => setMessage(''), 3000);
  };

  // 친구 요청 수락
  const acceptFriendRequest = async (requestId: string, requesterId: string) => {
    if (!user) return;

    // 기존 요청 상태 업데이트
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    // 양방향 친구 관계 생성
    await supabase.from('friendships').insert({
      user_id: user.id,
      friend_id: requesterId,
      status: 'accepted',
    });

    loadFriends();
    loadFriendRequests();
    setMessage('친구가 되었습니다.');
    setTimeout(() => setMessage(''), 3000);
  };

  // 친구 요청 거절
  const rejectFriendRequest = async (requestId: string) => {
    await supabase.from('friendships').delete().eq('id', requestId);

    loadFriendRequests();
  };

  // 친구 식단 보기
  const viewFriendDiet = (friendId: string, username: string) => {
    router.push(`/friends/${friendId}?name=${encodeURIComponent(username)}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="animate-pulse text-pink-400">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">친구</h1>
        <p className="text-gray-400 text-sm mt-1">친구의 식단을 구경해요</p>
      </div>

      {/* 메시지 */}
      {message && (
        <div className="bg-pink-50 text-pink-600 text-sm p-3 rounded-xl mb-4 text-center">
          {message}
        </div>
      )}

      {/* 검색 */}
      <div className="card rounded-2xl p-4 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="아이디로 친구 찾기"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl btn-primary text-sm font-medium"
          >
            {isSearching ? '...' : '검색'}
          </button>
        </div>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <span className="font-medium text-gray-700">{profile.username}</span>
                <button
                  onClick={() => sendFriendRequest(profile.id)}
                  className="px-3 py-1.5 rounded-lg bg-pink-100 text-pink-600 text-sm font-medium"
                >
                  친구 요청
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          친구 ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          요청 ({friendRequests.length})
        </button>
      </div>

      {/* 친구 목록 */}
      {activeTab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-gray-400">아직 친구가 없어요</p>
              <p className="text-gray-300 text-sm mt-1">아이디로 친구를 찾아보세요</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="card rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {friend.friend_profile?.username || '알 수 없음'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    viewFriendDiet(
                      friend.friend_id,
                      friend.friend_profile?.username || ''
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-pink-50 text-pink-600 text-sm font-medium"
                >
                  식단 보기
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 친구 요청 */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {friendRequests.length === 0 ? (
            <div className="card rounded-2xl p-8 text-center">
              <p className="text-gray-400">받은 친구 요청이 없어요</p>
            </div>
          ) : (
            friendRequests.map((request) => (
              <div
                key={request.id}
                className="card rounded-2xl p-4 flex items-center justify-between"
              >
                <p className="font-medium text-gray-800">
                  {request.requester_profile?.username || '알 수 없음'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id, request.user_id)}
                    className="px-3 py-1.5 rounded-lg bg-pink-500 text-white text-sm font-medium"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-600 text-sm font-medium"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
