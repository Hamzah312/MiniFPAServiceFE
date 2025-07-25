module.exports = {
  '/api/*': {
    target: 'http://localhost:5210',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      console.log('🔄 Proxying:', req.method, req.url, '-> http://localhost:5210' + req.url);
    },
    onError: function (err, req, res) {
      console.log('❌ Proxy Error:', err.message);
      console.log('   Request was:', req.method, req.url);
    }
  }
};
