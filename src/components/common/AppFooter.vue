<template>
  <footer class="bg-gray-900 text-gray-300 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo & Description -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-2 mb-4">
            <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">Z</span>
            </div>
            <span class="text-xl font-bold text-white">ZIP-Chack</span>
          </div>
          <p class="text-gray-400 leading-relaxed">
            실거주자 리뷰 기반 원룸 정보 플랫폼.<br />
            더 나은 자취 생활을 위한 첫걸음.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="text-white font-semibold mb-4">서비스</h4>
          <ul class="space-y-2">
            <li><router-link to="/listings" class="hover:text-white transition-colors">매물 찾기</router-link></li>
            <li><router-link to="/map" class="hover:text-white transition-colors">지도 검색</router-link></li>
            <li><router-link to="/favorites" class="hover:text-white transition-colors">찜 목록</router-link></li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h4 class="text-white font-semibold mb-4">고객지원</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition-colors">이용약관</a></li>
            <li><a href="#" class="hover:text-white transition-colors">개인정보처리방침</a></li>
            <li><a href="#" class="hover:text-white transition-colors">고객센터</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
        &copy; 2025 ZIP-Chack. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>
