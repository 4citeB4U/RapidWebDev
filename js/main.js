// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
  // Setup background image rotation
  const bgImages = document.querySelectorAll('.bg-image');
  let currentBgIndex = 0;
  
  function rotateBackgroundImages() {
    // Hide current image
    bgImages[currentBgIndex].style.opacity = 0;
    
    // Move to next image
    currentBgIndex = (currentBgIndex + 1) % bgImages.length;
    
    // Show new image
    bgImages[currentBgIndex].style.opacity = 1;
    
    // Schedule next rotation
    setTimeout(rotateBackgroundImages, 8000);
  }
  
  // Start rotation if there are background images
  if (bgImages.length > 0) {
    // Make sure first image is visible
    bgImages[0].style.opacity = 1;
    
    // Start rotation after 8 seconds
    setTimeout(rotateBackgroundImages, 8000);
  }
  
  // Adjust overview background images positions and sizes
  function adjustOverviewBackgrounds() {
    const overviewSection = document.getElementById('overview');
    if (!overviewSection) return;
    
    const overviewBgs = document.querySelectorAll('.overview-bg');
    const overviewHeight = overviewSection.offsetHeight;
    
    if (overviewBgs.length >= 3) {
      const sectionHeight = overviewHeight / 3;
      
      // Set heights for each background section to match content
      overviewBgs[0].style.height = sectionHeight + 'px';
      overviewBgs[1].style.height = sectionHeight + 'px';
      overviewBgs[1].style.top = sectionHeight + 'px';
      overviewBgs[2].style.height = sectionHeight + 'px';
      overviewBgs[2].style.top = (sectionHeight * 2) + 'px';
      
      // Make sure all backgrounds are visible
      overviewBgs.forEach(bg => {
        bg.style.display = 'block';
      });
    }
  }
  
  // Run on load and window resize to ensure backgrounds fit content
  window.addEventListener('load', adjustOverviewBackgrounds);
  window.addEventListener('resize', adjustOverviewBackgrounds);
  // Preloader functionality
  const loader = document.querySelector('.loader');
  
  // Hide loader immediately after page loads
  window.addEventListener('load', function() {
    loader.classList.add('hidden');
    document.body.classList.add('loaded');
    
    // Make sure the body is scrollable immediately
    document.body.style.overflow = "auto";
  });

  // SPA Navigation - Page View Handling
  function initPageNavigation() {
    // Get all page view elements
    const pageViews = document.querySelectorAll('.page-view');
    const pageLinks = document.querySelectorAll('[data-page]');
    
    // Initialize to show beginning page by default
    showPage('beginning');
    updateActiveNavLink('beginning');
    
    // Add click event listeners to all navigation links
    pageLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        
        // Show loading animation
        document.body.classList.add('page-transitioning');
        
        // Wait a bit before showing the new page
        setTimeout(() => {
          showPage(targetPage);
          updateActiveNavLink(targetPage);
          document.body.classList.remove('page-transitioning');
          
          // Update URL hash (for bookmarking/sharing)
          window.location.hash = targetPage;
        }, 500);
      });
    });
    
    // Handle direct access via URL hash
    window.addEventListener('load', function() {
      const hash = window.location.hash.substring(1);
      if (hash && document.getElementById(hash)) {
        showPage(hash);
        updateActiveNavLink(hash);
      }
    });
    
    // Handle back/forward browser navigation
    window.addEventListener('hashchange', function() {
      const hash = window.location.hash.substring(1);
      if (hash && document.getElementById(hash)) {
        showPage(hash);
        updateActiveNavLink(hash);
      }
    });
    
    // Function to show the selected page and hide others
    function showPage(pageId) {
      // Hide all pages
      pageViews.forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
      });
      
      // Show the selected page
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
        
        // Animate elements within the page
        const animatedElements = targetPage.querySelectorAll('.fade-up, .fade-in');
        animatedElements.forEach(element => {
          element.style.animationPlayState = 'running';
        });
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Initialize charts if they exist on this page
        initPageCharts(pageId);
      }
    }
    
    // Update active state in navigation
    function updateActiveNavLink(pageId) {
      pageLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
  
  // Initialize SPA navigation
  if (document.querySelector('.page-view')) {
    initPageNavigation();
  }

  // Initialize charts based on the current page
  function initPageCharts(pageId) {
    if (pageId === 'truth') {
      // Initialize charts for the Truth page
      initRoyaltyBreakdownChart();
      initCDRevenueChart();
      initArtistDeductionsChart();
      initDealMultiplierChart();
      initStreamValueChart();
      initPlatformComparisonChart();
      initRecoupmentExpensesChart();
      initAlbumRevenueChart();
    } else if (pageId === 'win') {
      // Initialize charts for the Win page
    } else if (pageId === 'community') {
      // Initialize community fan board
      initFanBoard();
    }
    
    // Initialize videos for all pages
    initVideoPlayers();
  }
  
  // Initialize all Chart.js visualizations
  function initRoyaltyBreakdownChart() {
    const ctx = document.getElementById('royaltyBreakdownChart');
    if (!ctx) return;
    
    // Destroy existing chart instance if it exists
    if (window.royaltyBreakdownChart instanceof Chart) {
      window.royaltyBreakdownChart.destroy();
    }
    
    window.royaltyBreakdownChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Major Label Company', 'Production & Distribution', 'Marketing & Promotion', 'Artist Royalty'],
        datasets: [{
          label: 'Revenue Distribution from $10 CD',
          data: [4.50, 3.25, 2.03, 0.22],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.parsed.x.toFixed(2) + ' (' + 
                    (context.parsed.x * 10).toFixed(0) + '%)';
              }
            }
          }
        }
      }
    });
  }
  
  function initCDRevenueChart() {
    const ctx = document.getElementById('cdRevenueChart');
    if (!ctx) return;
    
    if (window.cdRevenueChart instanceof Chart) {
      window.cdRevenueChart.destroy();
    }
    
    window.cdRevenueChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Label', 'Production', 'Distribution', 'Artist'],
        datasets: [{
          data: [45, 30, 23, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 12
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map(function(label, i) {
                    const meta = chart.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i);
                    
                    return {
                      text: label + ': ' + data.datasets[0].data[i] + '%',
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor[i],
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return label + ': ' + value + '%';
              }
            }
          }
        }
      }
    });
  }
  
  function initArtistDeductionsChart() {
    const ctx = document.getElementById('artistDeductionsChart');
    if (!ctx) return;
    
    if (window.artistDeductionsChart instanceof Chart) {
      window.artistDeductionsChart.destroy();
    }
    
    window.artistDeductionsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Base Royalty', 'After Packaging', 'After Free Goods', 'After Digital Reduction', 'Final Take'],
        datasets: [{
          label: 'Artist Royalty (%)',
          data: [15, 12, 7.5, 4, 2.25],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)'
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + '%';
              }
            }
          }
        }
      }
    });
  }
  
  function initDealMultiplierChart() {
    const ctx = document.getElementById('dealMultiplierChart');
    if (!ctx) return;
    
    if (window.dealMultiplierChart instanceof Chart) {
      window.dealMultiplierChart.destroy();
    }
    
    window.dealMultiplierChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Streaming', 'Merchandise', 'Touring', 'Publishing', 'Branding', 'NFTs'],
        datasets: [{
          label: 'Traditional Label',
          data: [50, 30, 15, 25, 20, 35],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.3)'
        }, {
          label: 'LEEWAY Platform',
          data: [15, 10, 5, 5, 7, 12],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.3)'
        }]
      },
      options: {
        responsive: true,
        elements: {
          line: {
            borderWidth: 3
          }
        },
        scales: {
          r: {
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 12
              }
            },
            ticks: {
              backdropColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return value + '%';
              }
            },
            suggestedMin: 0,
            suggestedMax: 60
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.r + '%';
              }
            }
          }
        }
      }
    });
  }
  
  function initStreamValueChart() {
    const ctx = document.getElementById('streamValueChart');
    if (!ctx) return;
    
    if (window.streamValueChart instanceof Chart) {
      window.streamValueChart.destroy();
    }
    
    window.streamValueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'TikTok'],
        datasets: [{
          label: 'Cents Per Stream',
          data: [0.35, 0.68, 0.42, 0.15, 0.03],
          backgroundColor: [
            'rgba(29, 185, 84, 0.7)',
            'rgba(250, 82, 82, 0.7)',
            'rgba(66, 133, 244, 0.7)',
            'rgba(255, 0, 0, 0.7)',
            'rgba(0, 0, 0, 0.7)'
          ],
          borderColor: [
            'rgb(29, 185, 84)',
            'rgb(250, 82, 82)',
            'rgb(66, 133, 244)',
            'rgb(255, 0, 0)',
            'rgb(0, 0, 0)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.parsed.y.toFixed(3) + ' per stream';
              },
              footer: function(tooltipItems) {
                const streams = [
                  2857143, // Streams needed for $1000 on Spotify
                  1470588, // Apple Music
                  2380952, // Amazon Music
                  6666667, // YouTube Music
                  33333333 // TikTok
                ];
                const index = tooltipItems[0].dataIndex;
                return 'Streams for $1000: ' + streams[index].toLocaleString();
              }
            }
          }
        }
      }
    });
  }
  
  function initPlatformComparisonChart() {
    const ctx = document.getElementById('platformComparisonChart');
    if (!ctx) return;
    
    if (window.platformComparisonChart instanceof Chart) {
      window.platformComparisonChart.destroy();
    }
    
    window.platformComparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'TikTok', 'LEEWAY Direct'],
        datasets: [{
          label: 'Platform Cut (%)',
          data: [70, 52, 60, 80, 90, 15],
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }, {
          label: 'Artist Share (%)',
          data: [30, 48, 40, 20, 10, 85],
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + '%';
              }
            }
          },
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    });
  }
  
  function initRecoupmentExpensesChart() {
    const ctx = document.getElementById('recoupmentExpensesChart');
    if (!ctx) return;
    
    if (window.recoupmentExpensesChart instanceof Chart) {
      window.recoupmentExpensesChart.destroy();
    }
    
    window.recoupmentExpensesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Advance', 'Recording Costs', 'Video Budget', 'Promotion'],
        datasets: [{
          label: 'Recoupable Expenses',
          data: [250000, 150000, 75000, 100000],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return label + ': $' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
  
  function initAlbumRevenueChart() {
    const ctx = document.getElementById('albumnRevenueChart');
    if (!ctx) return;
    
    if (window.albumnRevenueChart instanceof Chart) {
      window.albumnRevenueChart.destroy();
    }
    
    window.albumnRevenueChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Label Share', 'Artist Royalty', 'Recouped by Label'],
        datasets: [{
          data: [850000, 0, 150000],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(255, 159, 64)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return label + ': $' + value.toLocaleString() + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  }

  // Initialize Revenue Comparison Chart
  function initRevenueComparisonChart(amount) {
    const ctx = document.getElementById('revenueComparisonChart');
    if (!ctx) return;
    
    // Calculate values
    const labelAmount = amount * 0.04;
    const artistAmount = amount * 0.45;
    const leewayAmount = amount * 0.85;
    
    if (window.revenueComparisonChart instanceof Chart) {
      window.revenueComparisonChart.destroy();
    }
    
    window.revenueComparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Major Label Deal', 'Industry Average', 'LEEWAY Platform'],
        datasets: [{
          label: 'Artist Net Income',
          data: [labelAmount, artistAmount, leewayAmount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const totalValue = amount;
                const value = context.parsed.y;
                const percentage = ((value / totalValue) * 100).toFixed(1);
                return 'Artist gets: $' + value.toLocaleString() + 
                       ' (' + percentage + '% of $' + totalValue.toLocaleString() + ')';
              }
            }
          }
        }
      }
    });
  }
  
  // Initialize fan board in community section
  function initFanBoard() {
    const communitySection = document.getElementById('community');
    if (!communitySection) return;
    
    // Check if fan board already exists
    if (document.querySelector('.fan-board')) return;
    
    // Find the appropriate location to add the fan board
    const targetSection = communitySection.querySelector('.section-padding:nth-child(3)');
    if (!targetSection) return;
    
    // Create fan board HTML
    const fanBoardHTML = `
      <section class="fan-board-section section-padding" style="background: var(--darker);">
        <div class="container">
          <h2 class="section-title text-center fade-up">FAN BOARD</h2>
          <p class="overview-text text-center fade-up delay-2" style="margin-bottom: 4rem;">
            A place for your community to connect, share thoughts, and support your journey.
          </p>
          
          <div class="fan-board fade-up delay-3" style="max-width: 900px; margin: 0 auto;">
            <div class="fan-board-posts" style="margin-bottom: 3rem;">
              <!-- Fan posts will appear here -->
              <div class="fan-post" style="background: rgba(18, 18, 18, 0.7); border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div class="fan-post-header" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                  <div class="fan-avatar" style="width: 5rem; height: 5rem; border-radius: 50%; background: var(--gradient-1); display: flex; align-items: center; justify-content: center; margin-right: 1.5rem; font-weight: 700; font-size: 2rem; color: var(--light);">JD</div>
                  <div>
                    <h4 style="font-size: 1.8rem; margin-bottom: 0.5rem;">James Davis</h4>
                    <p style="font-size: 1.4rem; color: var(--light-gray); margin: 0;">Posted 2 days ago</p>
                  </div>
                </div>
                <div class="fan-post-content">
                  <p style="font-size: 1.6rem; line-height: 1.7; margin-bottom: 2rem;">
                    Your last album changed my life! The way you talk about breaking away from the industry standards really resonated with me as an indie filmmaker. Keep blazing your own trail! 🔥
                  </p>
                  <div class="fan-post-actions" style="display: flex; gap: 2rem; font-size: 1.4rem;">
                    <button class="fan-like-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                      <i class="fas fa-heart" style="color: var(--primary); margin-right: 0.5rem;"></i>
                      <span>42 Likes</span>
                    </button>
                    <button class="fan-reply-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                      <i class="fas fa-reply" style="margin-right: 0.5rem;"></i>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="fan-post" style="background: rgba(18, 18, 18, 0.7); border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div class="fan-post-header" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                  <div class="fan-avatar" style="width: 5rem; height: 5rem; border-radius: 50%; background: var(--gradient-2); display: flex; align-items: center; justify-content: center; margin-right: 1.5rem; font-weight: 700; font-size: 2rem; color: var(--light);">SM</div>
                  <div>
                    <h4 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Sarah Martinez</h4>
                    <p style="font-size: 1.4rem; color: var(--light-gray); margin: 0;">Posted 3 days ago</p>
                  </div>
                </div>
                <div class="fan-post-content">
                  <p style="font-size: 1.6rem; line-height: 1.7; margin-bottom: 2rem;">
                    Just got my merch package today and the quality is AMAZING! The direct-to-fan model really shows in the care you put into everything. Can't wait for the virtual meet & greet next week! 💯
                  </p>
                  <div class="fan-post-actions" style="display: flex; gap: 2rem; font-size: 1.4rem;">
                    <button class="fan-like-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                      <i class="fas fa-heart" style="color: var(--primary); margin-right: 0.5rem;"></i>
                      <span>28 Likes</span>
                    </button>
                    <button class="fan-reply-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                      <i class="fas fa-reply" style="margin-right: 0.5rem;"></i>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="fan-post" style="background: rgba(18, 18, 18, 0.7); border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div class="fan-post-header" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                  <div class="fan-avatar" style="width: 5rem; height: 5rem; border-radius: 50%; background: var(--gradient-3); display: flex; align-items: center; justify-content: center; margin-right: 1.5rem; font-weight: 700; font-size: 2rem; color: var(--light);">TJ</div>
                  <div>
                    <h4 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Tyler Johnson</h4>
                    <p style="font-size: 1.4rem; color: var(--light-gray); margin: 0;">Posted 5 days ago</p>
                  </div>
                </div>
                <div class="fan-post-content">
                  <p style="font-size: 1.6rem; line-height: 1.7; margin-bottom: 2rem;">
                    I've been following since the beginning and it's incredible to see how you've built this entire platform independently. The NFT drop last month was genius - still have mine displayed as my profile pic everywhere! 🙌
                  </p>
                  <div class="fan-post-actions" style="display: flex; gap: 2rem; font-size: 1.4rem;">
                    <button class="fan-like-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                      <i class="fas fa-heart" style="color: var(--primary); margin-right: 0.5rem;"></i>
                      <span>35 Likes</span>
                    </button>
                    <button class="fan-reply-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                      <i class="fas fa-reply" style="margin-right: 0.5rem;"></i>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="fan-board-form" style="background: rgba(18, 18, 18, 0.9); border-radius: 1.5rem; padding: 2.5rem; border: 1px solid rgba(255, 255, 255, 0.1);">
              <h3 style="font-size: 2.4rem; margin-bottom: 2rem;">Join the Conversation</h3>
              <form id="fan-post-form">
                <div style="margin-bottom: 2rem;">
                  <label for="fan-name" style="display: block; margin-bottom: 1rem; font-size: 1.6rem; color: var(--light);">Your Name</label>
                  <input type="text" id="fan-name" style="width: 100%; padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05); color: var(--light); font-size: 1.6rem;">
                </div>
                
                <div style="margin-bottom: 2rem;">
                  <label for="fan-message" style="display: block; margin-bottom: 1rem; font-size: 1.6rem; color: var(--light);">Your Message</label>
                  <textarea id="fan-message" rows="4" style="width: 100%; padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05); color: var(--light); font-size: 1.6rem; resize: vertical;"></textarea>
                </div>
                
                <button type="submit" class="btn" style="width: 100%;">Post to Fan Board</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
    
    // Insert fan board before the target section
    targetSection.insertAdjacentHTML('beforebegin', fanBoardHTML);
    
    // Initialize fan board functionality
    initFanBoardFunctionality();
  }
  
  // Initialize fan board interactivity
  function initFanBoardFunctionality() {
    const fanPostForm = document.getElementById('fan-post-form');
    if (!fanPostForm) return;
    
    fanPostForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('fan-name');
      const messageInput = document.getElementById('fan-message');
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();
      
      if (name && message) {
        // Generate initials for avatar
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Generate random gradient for avatar
        const gradients = ['var(--gradient-1)', 'var(--gradient-2)', 'var(--gradient-3)'];
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        // Create new post HTML
        const newPost = `
          <div class="fan-post" style="background: rgba(18, 18, 18, 0.7); border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; border: 1px solid rgba(255, 255, 255, 0.1); opacity: 0; transform: translateY(20px); transition: all 0.5s ease;">
            <div class="fan-post-header" style="display: flex; align-items: center; margin-bottom: 1.5rem;">
              <div class="fan-avatar" style="width: 5rem; height: 5rem; border-radius: 50%; background: ${randomGradient}; display: flex; align-items: center; justify-content: center; margin-right: 1.5rem; font-weight: 700; font-size: 2rem; color: var(--light);">${initials}</div>
              <div>
                <h4 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${name}</h4>
                <p style="font-size: 1.4rem; color: var(--light-gray); margin: 0;">Posted just now</p>
              </div>
            </div>
            <div class="fan-post-content">
              <p style="font-size: 1.6rem; line-height: 1.7; margin-bottom: 2rem;">
                ${message}
              </p>
              <div class="fan-post-actions" style="display: flex; gap: 2rem; font-size: 1.4rem;">
                <button class="fan-like-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                  <i class="fas fa-heart" style="margin-right: 0.5rem;"></i>
                  <span>0 Likes</span>
                </button>
                <button class="fan-reply-btn" style="background: none; border: none; color: var(--light); display: flex; align-items: center; cursor: pointer;">
                  <i class="fas fa-reply" style="margin-right: 0.5rem;"></i>
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        `;
        
        // Add new post to the fan board
        const fanBoardPosts = document.querySelector('.fan-board-posts');
        fanBoardPosts.insertAdjacentHTML('afterbegin', newPost);
        
        // Animate the new post after a small delay
        setTimeout(() => {
          const newPostElement = fanBoardPosts.querySelector('.fan-post:first-child');
          newPostElement.style.opacity = '1';
          newPostElement.style.transform = 'translateY(0)';
        }, 10);
        
        // Clear the form
        nameInput.value = '';
        messageInput.value = '';
        
        // Add like functionality to the new post
        initFanPostLikes();
      }
    });
    
    // Initialize existing likes
    initFanPostLikes();
  }
  
  // Initialize like functionality on fan posts
  function initFanPostLikes() {
    document.querySelectorAll('.fan-like-btn').forEach(button => {
      // Remove existing event listeners to prevent duplicates
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add event listener to the new button
      newButton.addEventListener('click', function() {
        const likeIcon = this.querySelector('i');
        const likeText = this.querySelector('span');
        
        if (likeIcon.style.color !== 'rgb(255, 51, 102)') {
          // Like
          likeIcon.style.color = 'rgb(255, 51, 102)';
          const currentLikes = parseInt(likeText.textContent.split(' ')[0]);
          likeText.textContent = `${currentLikes + 1} Likes`;
        } else {
          // Unlike
          likeIcon.style.color = '';
          const currentLikes = parseInt(likeText.textContent.split(' ')[0]);
          likeText.textContent = `${currentLikes - 1} Likes`;
        }
      });
    });
  }
  
  // Initialize video players
  function initVideoPlayers() {
    // Initialize video.js players
    const videoElements = document.querySelectorAll('video.video-js');
    videoElements.forEach(video => {
      // Check if video player is already initialized
      if (!video.player) {
        const player = videojs(video.id, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          responsive: true,
          fluid: true,
          playbackRates: [0.5, 1, 1.5, 2]
        });
        
        // Add custom event listeners or behaviors if needed
        player.on('play', function() {
          // Pause all other videos when this one plays
          videoElements.forEach(otherVideo => {
            if (otherVideo.id !== video.id && otherVideo.player) {
              otherVideo.player.pause();
            }
          });
        });
      }
    });
  }

  // Scroll animation
  const scrollBtn = document.querySelector('.hero-scroll');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function() {
      const aboutSection = document.querySelector('#story');
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Card flip functionality
  document.querySelectorAll('.tier-card-inner').forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't flip if clicked on a link or button
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
        e.stopPropagation();
        return;
      }
      this.parentElement.classList.toggle('flipped');
    });
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      this.classList.toggle('active');
    });
  }

  // Smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]:not([data-page])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          mobileMenuBtn.classList.remove('active');
        }
      }
    });
  });

  // Scroll header effect
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Initialize platform page navigation
  function initPlatformsTabs() {
    const platformTabs = document.querySelectorAll('.platform-tab');
    
    platformTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        platformTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Filter platform cards based on selection
        const selectedCategory = this.textContent.trim();
        const platformCards = document.querySelectorAll('.platform-card');
        
        platformCards.forEach(card => {
          if (selectedCategory === 'All Templates' || 
              card.classList.contains(selectedCategory.toLowerCase().replace('the ', '').replace(' ', '-'))) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
  
  // Initialize platforms page functionality if we're on that page
  if (document.querySelector('.platform-tab')) {
    initPlatformsTabs();
  }

  // Initialize page transitions for regular links
  function initPageTransitions() {
    const navLinks = document.querySelectorAll('a[href$=".html"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Only for internal links
        if(this.getAttribute('target') !== '_blank') {
          e.preventDefault();
          const targetPage = this.getAttribute('href');
          
          // Add fade-out class to body
          document.body.style.opacity = '0';
          
          // Navigate after animation completes
          setTimeout(() => {
            window.location.href = targetPage;
          }, 500);
        }
      });
    });
  }
  
  // Initialize page transitions
  initPageTransitions();

  // Mouse cursor effect
  const cursorTracker = document.createElement('div');
  cursorTracker.className = 'cursor-tracker';
  document.body.appendChild(cursorTracker);
  
  let cursorVisible = false;
  let cursorMoving = false;
  let cursorTimeout;
  
  // Show cursor on mouse move
  document.addEventListener('mousemove', function(e) {
    cursorVisible = true;
    cursorMoving = true;
    
    // Show the cursor
    cursorTracker.style.opacity = '1';
    
    // Position the cursor
    cursorTracker.style.left = `${e.clientX}px`;
    cursorTracker.style.top = `${e.clientY}px`;
    
    // Clear the timeout
    clearTimeout(cursorTimeout);
    
    // Set a timeout to hide cursor if not moved
    cursorTimeout = setTimeout(() => {
      cursorMoving = false;
      if (!cursorMoving) {
        cursorTracker.style.opacity = '0';
      }
    }, 3000);
  });
  
  // Hide cursor when leaving the window
  document.addEventListener('mouseleave', function() {
    cursorTracker.style.opacity = '0';
    cursorVisible = false;
  });

  // Parallax effect on scroll
  const parallaxElements = document.querySelectorAll('.parallax-bg');
  
  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(element => {
      const speed = element.getAttribute('data-speed') || 0.5;
      element.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });

  // Animate elements on scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-up, .fade-in');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 100) {
        element.style.animationPlayState = 'running';
      }
    });
  }
  
  window.addEventListener('scroll', animateOnScroll);
  
  // Trigger once on load to animate visible items
  animateOnScroll();

  // Interactive graphs and revenue calculator
  function initRevenueCalculator() {
    const revenueInput = document.getElementById('revenue-input');
    const calculateBtn = document.getElementById('calculate-revenue');
    const labelRevenue = document.getElementById('label-revenue');
    const artistRevenue = document.getElementById('artist-revenue');
    const leewayRevenue = document.getElementById('leeway-revenue');
    
    if (calculateBtn) {
      calculateBtn.addEventListener('click', function() {
        const amount = parseFloat(revenueInput.value) || 0;
        
        // Calculate label vs artist revenue
        const labelAmount = (amount * 0.04).toFixed(2);
        const artistAmount = (amount * 0.45).toFixed(2);
        const leewayAmount = (amount * 0.85).toFixed(2);
        
        // Update the displayed values
        labelRevenue.textContent = `$${labelAmount}`;
        artistRevenue.textContent = `$${artistAmount}`;
        leewayRevenue.textContent = `$${leewayAmount}`;
        
        // Update the chart bars
        document.querySelector('.label-bar').style.height = '4%';
        document.querySelector('.artist-bar').style.height = '45%';
        document.querySelector('.leeway-bar').style.height = '85%';
        
        // Initialize or update the revenue comparison chart
        initRevenueComparisonChart(amount);
        
        // Show the results section
        document.querySelector('.revenue-results').classList.remove('hidden');
      });
    }
  }
  
  // Initialize revenue calculator if the elements exist
  if (document.getElementById('calculate-revenue')) {
    initRevenueCalculator();
  }
  
  // Agent Lee Chat Functionality
  function initAgentLeeChat() {
    const chatToggle = document.querySelector('.agent-chat-toggle');
    const agentChat = document.querySelector('.agent-chat-card');
    const chatForm = document.querySelector('.agent-chat-form');
    const chatInput = document.querySelector('.agent-chat-input');
    const chatMessages = document.querySelector('.agent-chat-messages');
    
    if (chatToggle) {
      // Toggle chat open/closed
      chatToggle.addEventListener('click', function() {
        agentChat.classList.toggle('open');
        chatToggle.classList.toggle('active');
      });
      
      // Handle form submission
      if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const message = chatInput.value.trim();
          if (message) {
            // Add user message
            addChatMessage(message, 'user');
            chatInput.value = '';
            
            // Simulate Agent Lee response
            setTimeout(() => {
              let response = "I'm Agent Lee, here to help you with your music career. What specific question do you have about the platform?";
              
              // Context-aware responses based on current page
              const currentPage = document.querySelector('.page-view.active');
              if (currentPage) {
                const pageId = currentPage.id;
                
                if (pageId === 'truth' && message.toLowerCase().includes('revenue')) {
                  response = "In traditional label deals, artists receive only about 4% of revenue. With our platform, you keep 85% of all earnings - that's over 20x more in your pocket!";
                } else if (pageId === 'win' && message.toLowerCase().includes('sell')) {
                  response = "You can sell almost anything through your platform: music, merch, NFTs, tickets, exclusive content, and even direct fan experiences. What would you like to start with?";
                } else if (pageId === 'community' && message.toLowerCase().includes('fan')) {
                  response = "Our platform gives you direct communication with fans through email, SMS, and push notifications. You own your fan data 100% - no middlemen.";
                }
              }
              
              addChatMessage(response, 'agent');
            }, 1000);
          }
        });
      }
    }
    
    // Function to add messages to chat
    function addChatMessage(message, sender) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('agent-chat-message', `${sender}-message`);
      messageElement.textContent = message;
      
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // If this is a user message, trigger Agent Lee's response
      if (sender === 'user') {
        setTimeout(() => {
          respondToUserMessage(message);
        }, 800);
      }
    }
    
    // Function to generate better responses based on context
    function respondToUserMessage(userMessage) {
      // Convert user message to lowercase for easier matching
      const messageLower = userMessage.toLowerCase();
      let response = "I'm Agent Lee, your AI assistant. How can I help with your artist platform?";
      
      // Check for specific topics in user message
      if (messageLower.includes('hello') || messageLower.includes('hi ') || messageLower.includes('hey')) {
        response = "Hello! I'm Agent Lee, your platform assistant. I can help with managing your content, connecting with fans, and optimizing your artist presence. What would you like to know?";
      }
      else if (messageLower.includes('login') || messageLower.includes('sign in') || messageLower.includes('account')) {
        response = "Our login system lets you access your artist dashboard securely. Would you like me to help you set up your account or recover your credentials?";
      }
      else if (messageLower.includes('music') || messageLower.includes('track') || messageLower.includes('song') || messageLower.includes('album')) {
        response = "Your music is your asset. On this platform, you keep 100% ownership of your masters while reaching your fans directly. Would you like to learn how to upload and monetize your music?";
      }
      else if (messageLower.includes('fan') || messageLower.includes('audience') || messageLower.includes('listener')) {
        response = "Building your fan community is essential. With our platform, you own your fan data and can communicate directly through email, text, and custom channels. Would you like to see how to grow your audience?";
      }
      else if (messageLower.includes('money') || messageLower.includes('revenue') || messageLower.includes('profit') || messageLower.includes('income')) {
        response = "Unlike traditional labels that take 85-95% of your revenue, on this platform you keep 85% of all earnings. Your creative work should generate wealth for YOU, not middlemen.";
      }
      else if (messageLower.includes('help') || messageLower.includes('support') || messageLower.includes('contact')) {
        response = "You can reach our support team at agentlee@rapidwebdevelop.com, call sales at 414-626-9992 or support at 414-367-6211. We're based in Milwaukee, WI 53206 and are here to help you succeed.";
      }
      else if (messageLower.includes('label') || messageLower.includes('contract') || messageLower.includes('deal')) {
        response = "Traditional label deals often exploit artists, taking up to 95% of revenue and ownership of your masters. Our platform is built to empower artists with full ownership and transparent revenue sharing.";
      }
      
      // Add the response to chat
      addChatMessage(response, 'agent');
    }
  }
  
  // Agent Lee Card Functionality
  function initAgentLeeCard() {
    const agentLeeCard = document.getElementById('agent-lee-card');
    const agentLeeToggle = document.getElementById('agent-lee-toggle');
    const cardHeader = document.getElementById('card-header');
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');
    const cardBody = document.getElementById('card-body');
    const databaseView = document.getElementById('database-view');
    const settingsView = document.getElementById('settings-view');
    const guideView = document.getElementById('guide-view');
    
    // Memory/Guide/Settings buttons
    const memoryBtn = document.getElementById('memory-btn');
    const guideBtn = document.getElementById('guide-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const commandsBtn = document.getElementById('commands-btn');
    
    // Speech recognition buttons
    const listenBtn = document.getElementById('listen-btn');
    const stopBtn = document.getElementById('stop-btn');
    const finishedBtn = document.getElementById('finished-btn');
    const messageInput = document.getElementById('message-input');

    if (!agentLeeCard || !agentLeeToggle) return;
    
    // Initial state - hide the card
    agentLeeCard.style.display = 'none';
    
    // Toggle button click handler
    agentLeeToggle.addEventListener('click', function() {
      if (agentLeeCard.style.display === 'none') {
        agentLeeCard.style.display = 'block';
        // Set initial position if not set
        if (!agentLeeCard.style.top) {
          agentLeeCard.style.top = '100px';
        }
        if (!agentLeeCard.style.right) {
          agentLeeCard.style.right = '20px';
        }
        
        // Speak a greeting after a small delay
        setTimeout(() => {
          speakAgentLee("Hello! I'm Agent Lee, your professional assistant. How can I help you today?");
        }, 500);
      } else {
        agentLeeCard.style.display = 'none';
      }
    });
    
    // Minimize button click handler
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', function() {
        if (cardBody.style.display === 'none') {
          // Restore
          cardBody.style.display = 'block';
          databaseView.style.display = 'none';
          settingsView.style.display = 'none';
          guideView.style.display = 'none';
          minimizeBtn.textContent = '_';
        } else {
          // Minimize
          cardBody.style.display = 'none';
          databaseView.style.display = 'none';
          settingsView.style.display = 'none';
          guideView.style.display = 'none';
          minimizeBtn.textContent = '□';
        }
      });
    }
    
    // Close button click handler
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        agentLeeCard.style.display = 'none';
      });
    }
    
    // Card dragging functionality
    if (cardHeader) {
      let dragState = {
        isDragging: false,
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0
      };
      
      cardHeader.addEventListener('mousedown', function(e) {
        const styles = window.getComputedStyle(agentLeeCard);
        const left = parseInt(styles.left) || 0;
        const top = parseInt(styles.top) || 0;
        
        dragState = {
          isDragging: true,
          startX: e.clientX,
          startY: e.clientY,
          startLeft: left,
          startTop: top
        };
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
      });
      
      function handleDrag(e) {
        if (!dragState.isDragging) return;
        
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        agentLeeCard.style.left = `${dragState.startLeft + deltaX}px`;
        agentLeeCard.style.top = `${dragState.startTop + deltaY}px`;
        // Remove right position to avoid conflicts
        agentLeeCard.style.right = 'auto';
      }
      
      function stopDrag() {
        dragState.isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
      }
    }
    
    // View management
    function closeAllViews() {
      if (databaseView) databaseView.style.display = 'none';
      if (settingsView) settingsView.style.display = 'none';
      if (guideView) guideView.style.display = 'none';
    }
    
    // Memory button click handler
    if (memoryBtn) {
      memoryBtn.addEventListener('click', function() {
        closeAllViews();
        if (databaseView) {
          databaseView.style.display = 'block';
          speakAgentLee("Here is your memory database with all our conversations.");
        }
      });
    }
    
    // Settings button click handler
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function() {
        closeAllViews();
        if (settingsView) {
          settingsView.style.display = 'block';
          speakAgentLee("Here are your customization settings.");
        }
      });
    }
    
    // Guide button click handler
    if (guideBtn) {
      guideBtn.addEventListener('click', function() {
        closeAllViews();
        if (guideView) {
          guideView.style.display = 'block';
          speakAgentLee("Let me guide you through how to use this platform.");
        }
      });
    }
    
    // Commands button click handler
    if (commandsBtn) {
      commandsBtn.addEventListener('click', function() {
        speakAgentLee("You can ask me about platform features, artist services, or how to navigate the documentation. What would you like to know?");
      });
    }
    
    // Message input handler
    if (messageInput) {
      messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const text = messageInput.value.trim();
          if (text) {
            processUserMessage(text);
            messageInput.value = '';
          }
        }
      });
    }
    
    // Process user message
    function processUserMessage(text) {
      console.log("Processing user message:", text);
      
      // Simple keywords matching for context-aware responses
      let response = "I'm here to help with any questions about the artist platform. What specifically would you like to know?";
      
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes("hello") || lowerText.includes("hi")) {
        response = "Hello! I'm Agent Lee, your AI guide through the Artist Empowerment Platform. How can I help you today?";
      }
      else if (lowerText.includes("help")) {
        response = "I can help you navigate the platform, understand artist services, or explain how to monetize your music. What specific area do you need assistance with?";
      }
      else if (lowerText.includes("revenue") || lowerText.includes("money") || lowerText.includes("earn")) {
        response = "Unlike traditional labels that take 85-95% of your revenue, on this platform you keep 85% of all earnings. Your creative work should generate wealth for YOU, not middlemen.";
      }
      else if (lowerText.includes("documentation") || lowerText.includes("docs")) {
        response = "All platform documentation is available in the Research & Development section. Would you like me to take you there?";
      }
      
      speakAgentLee(response);
    }
    
    // Speech functionality
    function speakAgentLee(text) {
      // Update status
      const agentStatus = document.getElementById('agent-status');
      if (agentStatus) {
        agentStatus.textContent = "Speaking...";
        
        // Reset status after a delay proportional to message length
        setTimeout(() => {
          agentStatus.textContent = "Ready to assist";
        }, Math.min(text.length * 50, 10000));
      }
      
      // Use Web Speech API if available
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 1.0;
        speech.pitch = 1.0;
        speech.volume = 1.0;
        
        window.speechSynthesis.speak(speech);
      }
    }
    
    // Listen button functionality
    if (listenBtn) {
      listenBtn.addEventListener('click', function() {
        const agentStatus = document.getElementById('agent-status');
        if (agentStatus) {
          agentStatus.textContent = "Listening...";
        }
        
        // Check if Web Speech API is available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
          const recognition = new SpeechRecognition();
          
          recognition.lang = 'en-US';
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            processUserMessage(transcript);
          };
          
          recognition.onerror = function(event) {
            console.error('Speech recognition error', event);
            if (agentStatus) {
              agentStatus.textContent = "Error listening";
              setTimeout(() => {
                agentStatus.textContent = "Ready to assist";
              }, 2000);
            }
          };
          
          recognition.onend = function() {
            if (agentStatus) {
              agentStatus.textContent = "Ready to assist";
            }
          };
          
          recognition.start();
        } else {
          if (agentStatus) {
            agentStatus.textContent = "Speech recognition not supported";
            setTimeout(() => {
              agentStatus.textContent = "Ready to assist";
            }, 2000);
          }
        }
      });
    }
    
    // Stop speaking button
    if (stopBtn) {
      stopBtn.addEventListener('click', function() {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const agentStatus = document.getElementById('agent-status');
          if (agentStatus) {
            agentStatus.textContent = "Ready to assist";
          }
        }
      });
    }
  }
  
  // Initialize Agent Lee card if elements exist
  if (document.getElementById('agent-lee-card')) {
    window.addEventListener('load', function() {
      initAgentLeeCard();
    });
  }

  // Album breakdown animation 
  function initAlbumBreakdown() {
    const albumArt = document.querySelector('.album-art');
    const trackList = document.querySelector('.track-list');
    const expandBtn = document.getElementById('expand-album');
    
    if (expandBtn) {
      expandBtn.addEventListener('click', function() {
        albumArt.classList.toggle('expanded');
        trackList.classList.toggle('expanded');
      });
    }
  }
  
  // Initialize album breakdown if elements exist
  if (document.querySelector('.album-breakdown')) {
    initAlbumBreakdown();
  }
});