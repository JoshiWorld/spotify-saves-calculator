import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";

const prisma = new PrismaClient();

const accountsFilePath = "./export/accounts.json";
const affiliatesFilePath = "./export/affiliates.json";
const blogsFilePath = "./export/blogs.json";
const bugsFilePath = "./export/bugs.json";
const campaignsFilePath = "./export/campaigns.json";
// const categoriesFilePath = "./export/categories.json";
const commentsFilePath = "./export/comments.json";
const commentVotesFilePath = "./export/commentvotes.json";
const consentsFilePath = "./export/consents.json";
const conversionLogsFilePath = "./export/conversionlogs.json";
const coursesFilePath = "./export/courses.json";
const courseSectionsFilePath = "./export/coursesections.json";
const courseToUsersFilePath = "./export/coursetousers.json";
const courseVideosFilePath = "./export/coursevideos.json";
const courseVideoToUsersFilePath = "./export/coursevideotousers.json";
const dataSavesFilePath = "./export/datasaves.json";
const forumPostsFilePath = "./export/forumposts.json";
const genresFilePath = "./export/genres.json";
const linksFilePath = "./export/links.json";
const linkTrackingsFilePath = "./export/linktrackings.json";
// const logsFilePath = "./export/logs.json";
const metaAccountsFilePath = "./export/metaaccounts.json";
const ordersFilePath = "./export/orders.json";
// const otpsFilePath = "./export/otps.json";
const playlistAnalyseFilePath = "./export/playlistanalyses.json";
const postsFilePath = "./export/posts.json";
const productsFilePath = "./export/products.json";
const projectsFilePath = "./export/projects.json";
const roadmapItemsFilePath = "./export/roadmapitems.json";
const sessionsFilePath = "./export/sessions.json";
// const tagsFilePath = "./export/tags.json";
// const threadsFilePath = "./export/threads.json";
// const threadTagsFilePath = "./export/threadtags.json";
const usersFilePath = "./export/users.json";
const verificationTokenFilePath = "./export/verificationtokens.json";
const votesFilePath = "./export/votes.json";
const whitelistsFilePath = "./export/whitelists.json";

const mongoIdToPostgresIdMap = new Map<string, string>();

async function migrateData() {
    try {
        console.log("Starting data migration from MongoDB to PostgreSQL...");

        // 1. Benutzer migrieren (ohne Abhängigkeiten)
        const usersData = JSON.parse(await fs.readFile(usersFilePath, "utf-8"));
        console.log(`Migrating ${usersData.length} users...`);
        for (const mongoUser of usersData) {
            const newUser = await prisma.user.create({
                data: {
                    name: mongoUser.name,
                    email: mongoUser.email,
                    emailVerified: mongoUser.emailVerified
                        ? new Date(mongoUser.emailVerified.$date)
                        : null, // $date für MongoDB Date-Objekte
                    image: mongoUser.image,
                    admin: mongoUser.admin,
                    goodCPS: mongoUser.goodCPS,
                    midCPS: mongoUser.midCPS,
                    metaAccessToken: mongoUser.metaAccessToken,
                    package: mongoUser.package,
                    tester: mongoUser.tester
                },
            });
            mongoIdToPostgresIdMap.set(mongoUser._id.$oid || mongoUser._id, newUser.id);
            console.log(`User ${mongoUser.email} migrated with new ID: ${newUser.id}`);
        }
        console.log("Users migration complete.");

        // 2. Accounts migrieren (hängt von User ab)
        const accountsData = JSON.parse(await fs.readFile(accountsFilePath, "utf-8"));
        console.log(`Migrating ${accountsData.length} accounts...`);
        for (const mongoAccount of accountsData) {
            // Finde die neue userId basierend auf der alten Mongo-ID
            const newUserId = mongoIdToPostgresIdMap.get(
                mongoAccount.userId.$oid || mongoAccount.userId,
            );

            if (!newUserId) {
                console.warn(`Could not find new userId for account ${mongoAccount.id}. Skipping.`);
                continue;
            }

            await prisma.account.create({
                data: {
                    user: {
                        connect: {
                            id: newUserId
                        }
                    },
                    type: mongoAccount.type,
                    provider: mongoAccount.provider,
                    providerAccountId: mongoAccount.providerAccountId,
                    refresh_token: mongoAccount.refresh_token,
                    access_token: mongoAccount.access_token,
                    expires_at: mongoAccount.expires_at,
                    token_type: mongoAccount.token_type,
                    scope: mongoAccount.scope,
                    id_token: mongoAccount.id_token,
                    session_state: mongoAccount.session_state,
                    refresh_token_expires_in: mongoAccount.refresh_token_expires_in
                },
            });
            console.log(
                `Account for user ${newUserId} (Provider: ${mongoAccount.provider}) migrated.`,
            );
        }
        console.log("Accounts migration complete.");

        // 3. Sessions migrieren (hängt von User ab)
        const sessionsData = JSON.parse(await fs.readFile(sessionsFilePath, "utf-8"));
        console.log(`Migrating ${sessionsData.length} sessions...`);
        for (const mongoSession of sessionsData) {
            const newUserId = mongoIdToPostgresIdMap.get(
                mongoSession.userId.$oid || mongoSession.userId,
            );

            if (!newUserId) {
                console.warn(`Could not find new userId for session ${mongoSession.id}. Skipping.`);
                continue;
            }

            await prisma.session.create({
                data: {
                    sessionToken: mongoSession.sessionToken,
                    user: {
                        connect: {
                            id: newUserId
                        }
                    },
                    expires: new Date(mongoSession.expires.$date),
                },
            });
            console.log(`Session for user ${newUserId} migrated.`);
        }
        console.log("Sessions migration complete.");

        // Genres migrieren
        const genresData = JSON.parse(await fs.readFile(genresFilePath, "utf-8"));
        console.log(`Migrating ${genresData.length} genres...`);
        for(const mongoGenre of genresData) {
            const newGenre = await prisma.genre.create({
                data: {
                    name: mongoGenre.name
                }
            });
            mongoIdToPostgresIdMap.set(mongoGenre._id.$oid || mongoGenre._id, newGenre.id);
            console.log(`Genre ${mongoGenre.name} migrated with new ID: ${newGenre.id}`);
        }
        console.log("Genres migration complete.");

        // 4. Link-Modell migrieren (hängt ab von User & Genre)
        const linksData = JSON.parse(await fs.readFile(linksFilePath, "utf-8"));
        console.log(`Migrating ${linksData.length} links...`);
        for (const mongoLink of linksData) {
            const newLink = await prisma.link.create({
                data: {
                    createdAt: new Date(mongoLink.createdAt.$date),
                    updatedAt: new Date(mongoLink.updatedAt.$date),
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoLink.userId.$oid)
                        }
                    },
                    genre: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoLink.genreId.$oid)
                        }
                    },
                    playbutton: mongoLink.playbutton,
                    name: mongoLink.name,
                    enabled: mongoLink.enabled,
                    pixelId: mongoLink.pixelId,
                    accessToken: mongoLink.accessToken,
                    testEventCode: mongoLink.testEventCode,
                    artist: mongoLink.artist,
                    songtitle: mongoLink.songtitle,
                    description: mongoLink.description,
                    spotifyUri: mongoLink.spotifyUri,
                    appleUri: mongoLink.appleUri,
                    deezerUri: mongoLink.deezerUri,
                    itunesUri: mongoLink.itunesUri,
                    napsterUri: mongoLink.napsterUri,
                    image: mongoLink.image,
                    testMode: mongoLink.testMode,
                    glow: mongoLink.glow,
                    spotifyGlowColor: mongoLink.spotifyGlowColor,
                    appleMusicGlowColor: mongoLink.appleMusicGlowColor,
                    itunesGlowColor: mongoLink.itunesGlowColor,
                    deezerGlowColor: mongoLink.deezerGlowColor,
                    splittest: mongoLink.splittest,
                    splittestVersion: mongoLink.splittestVersion,
                },
            });
            mongoIdToPostgresIdMap.set(mongoLink._id.$oid || mongoLink._id, newLink.id);
            console.log(`Link ${mongoLink.name} migrated.`);
        }
        console.log("Links migration complete.");

        // Affiliates migrieren
        const affiliatesData = JSON.parse(await fs.readFile(affiliatesFilePath, "utf-8"));
        console.log(`Migrating ${affiliatesData.length} affiliates...`);
        for (const mongoAffiliate of affiliatesData) {
            await prisma.affiliate.create({
                data: {
                    digistoreId: mongoAffiliate.digistoreId,
                    email: mongoAffiliate.email,
                    firstName: mongoAffiliate.firstName,
                    lastName: mongoAffiliate.lastName,
                    promolink: mongoAffiliate.promolink,
                    language: mongoAffiliate.language,
                    createdAt: new Date(mongoAffiliate.create.$date),
                    lastUpdated: new Date(mongoAffiliate.lastUpdated.$date)
                }
            });
            console.log(`Affiliate ${mongoAffiliate.email} migrated`);
        }
        console.log("Affiliates migration complete.");


        // Blogs migrieren
        const blogsData = JSON.parse(await fs.readFile(blogsFilePath, "utf-8"));
        console.log(`Migrating ${blogsData.length} blogs...`);
        for (const mongoBlog of blogsData) {
            await prisma.blog.create({
                data: {
                    date: new Date(mongoBlog.date.$date),
                    title: mongoBlog.title,
                    description: mongoBlog.description,
                    slug: mongoBlog.slug,
                    image: mongoBlog.image,
                    author: mongoBlog.author,
                    authorAvatar: mongoBlog.authorAvatar
                }
            });
            console.log(`Blog ${mongoBlog.slug} migrated`);
        }
        console.log("Blogs migration complete.");


        // Bugs migrieren
        const bugsData = JSON.parse(await fs.readFile(bugsFilePath, "utf-8"));
        console.log(`Migrating ${bugsData.length} bugs...`);
        for (const mongoBug of bugsData) {
            await prisma.bug.create({
                data: {
                    createdAt: new Date(mongoBug.createdAt.$date),
                    updatedAt: new Date(mongoBug.updatedAt.$date),
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoBug.userId.$oid)
                        }
                    },
                    type: mongoBug.type,
                    screenshot: mongoBug.screenshot,
                    message: mongoBug.message,
                    resolved: mongoBug.resolved
                }
            });
            console.log(`Bug ${mongoBug._id.$oid} migrated`);
        }
        console.log("Bugs migration complete.");



        // Meta Accounts migrieren
        const metaAccountsData = JSON.parse(await fs.readFile(metaAccountsFilePath, "utf-8"));
        console.log(`Migrating ${metaAccountsData.length} metaaccounts...`);
        for (const mongoMetaAccount of metaAccountsData) {
            const newMetaAccount = await prisma.metaAccount.create({
                data: {
                    account_status: mongoMetaAccount.account_status,
                    accountId: mongoMetaAccount.accountId,
                    name: mongoMetaAccount.name,
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoMetaAccount.userId.$oid)
                        }
                    },
                }
            });
            mongoIdToPostgresIdMap.set(mongoMetaAccount._id.$oid || mongoMetaAccount._id, newMetaAccount.id);
            console.log(`MetaAccount ${mongoMetaAccount.name} migrated with new ID: ${newMetaAccount.id}`);
        }
        console.log("MetaAccounts migration complete.");


        // Projects migrieren
        const projectsData = JSON.parse(await fs.readFile(projectsFilePath, "utf-8"));
        console.log(`Migrating ${projectsData.length} projects...`);
        for (const mongoProject of projectsData) {
            if(mongoProject.metaAccountId) {
                const newProject = await prisma.project.create({
                    data: {
                        name: mongoProject.name,
                        createdAt: new Date(mongoProject.createdAt.$date),
                        updatedAt: new Date(mongoProject.updatedAt.$date),
                        user: {
                            connect: {
                                id: mongoIdToPostgresIdMap.get(mongoProject.userId.$oid)
                            }
                        },
                        metaAccount: {
                            connect: {
                                id: mongoIdToPostgresIdMap.get(mongoProject.metaAccountId.$oid)
                            }
                        }
                    }
                });
                mongoIdToPostgresIdMap.set(mongoProject._id.$oid || mongoProject._id, newProject.id);
                console.log(`Project ${mongoProject.name} migrated with new ID: ${newProject.id}`);

                continue;
            }

            const newProject = await prisma.project.create({
                data: {
                    name: mongoProject.name,
                    createdAt: new Date(mongoProject.createdAt.$date),
                    updatedAt: new Date(mongoProject.updatedAt.$date),
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoProject.userId.$oid)
                        }
                    },
                }
            });
            mongoIdToPostgresIdMap.set(mongoProject._id.$oid || mongoProject._id, newProject.id);
            console.log(`Project ${mongoProject.name} migrated with new ID: ${newProject.id}`);
        }
        console.log("Projects migration complete.");


        // Campaigns migrieren
        const campaignsData = JSON.parse(await fs.readFile(campaignsFilePath, "utf-8"));
        console.log(`Migrating ${campaignsData.length} campaigns...`);
        for (const mongoCampaign of campaignsData) {
            const newCampaign = await prisma.campaign.create({
                data: {
                    name: mongoCampaign.name,
                    createdAt: new Date(mongoCampaign.createdAt.$date),
                    updatedAt: new Date(mongoCampaign.updatedAt.$date),
                    project: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoCampaign.projectId.$oid)
                        }
                    },
                    metaCampaignId: mongoCampaign.metaCampaignId
                }
            });
            mongoIdToPostgresIdMap.set(mongoCampaign._id.$oid || mongoCampaign._id, newCampaign.id);
            console.log(`Campaign ${mongoCampaign.name} migrated with new ID: ${newCampaign.id}`);
        }
        console.log("Campaigns migration complete.");


        // Posts migrieren
        const postsData = JSON.parse(await fs.readFile(postsFilePath, "utf-8"));
        console.log(`Migrating ${postsData.length} posts...`);
        for (const mongoPost of postsData) {
            await prisma.post.create({
                data: {
                    createdAt: new Date(mongoPost.createdAt.$date),
                    updatedAt: new Date(mongoPost.updatedAt.$date),
                    campaign: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoPost.campaignId.$oid)
                        }
                    },
                    date: new Date(mongoPost.date.$date),
                    endDate: mongoPost.endDate ? new Date(mongoPost.endDate.$date) : null,
                    budget: mongoPost.budget,
                    saves: mongoPost.saves,
                    playlistAdds: mongoPost.playlistAdds
                }
            });
            console.log(`Post ${mongoPost._id.$oid} migrated`);
        }
        console.log("Posts migration complete.");



        // ForumPost migrieren
        const forumPostsData = JSON.parse(await fs.readFile(forumPostsFilePath, "utf-8"));
        console.log(`Migrating ${forumPostsData.length} forumposts...`);
        for (const mongoForumPost of forumPostsData) {
            const newForumPost = await prisma.forumPost.create({
                data: {
                    title: mongoForumPost.title,
                    content: mongoForumPost.content,
                    createdAt: new Date(mongoForumPost.createdAt.$date),
                    updatedAt: new Date(mongoForumPost.updatedAt.$date),
                    author: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoForumPost.authorId.$oid)
                        }
                    },
                }
            });
            mongoIdToPostgresIdMap.set(mongoForumPost._id.$oid || mongoForumPost._id, newForumPost.id);
            console.log(`ForumPost ${mongoForumPost.title} migrated with new ID: ${newForumPost.id}`);
        }
        console.log("ForumPosts migration complete.");


        // Comments migrieren
        // const commentsData = JSON.parse(await fs.readFile(commentsFilePath, "utf-8"));
        // console.log(`Migrating ${commentsData.length} comments...`);
        // for (const mongoComment of commentsData) {
        //     if(mongoComment.replyToId) {
        //         const newComment = await prisma.comment.create({
        //             data: {
        //                 text: mongoComment.text,
        //                 createdAt: new Date(mongoComment.createdAt.$date),
        //                 author: {
        //                     connect: {
        //                         id: mongoIdToPostgresIdMap.get(mongoComment.authorId.$oid)
        //                     }
        //                 },
        //                 post: {
        //                     connect: {
        //                         id: mongoIdToPostgresIdMap.get(mongoComment.postId.$oid)
        //                     }
        //                 },
        //                 replyTo: {
        //                     connect: {
        //                         id: mongoIdToPostgresIdMap.get(mongoComment._id.$oid)
        //                     }
        //                 }
        //             }
        //         });
        //         mongoIdToPostgresIdMap.set(mongoComment._id.$oid || mongoComment._id, newComment.id);
        //         console.log(`Comment ${mongoComment._id.$oid} migrated with new ID: ${newComment.id}`);
        //         continue;
        //     }

        //     const newComment = await prisma.comment.create({
        //         data: {
        //             text: mongoComment.text,
        //             createdAt: new Date(mongoComment.createdAt.$date),
        //             author: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoComment.authorId.$oid)
        //                 }
        //             },
        //             post: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoComment.postId.$oid)
        //                 }
        //             },
        //         }
        //     });
        //     mongoIdToPostgresIdMap.set(mongoComment._id.$oid || mongoComment._id, newComment.id);
        //     console.log(`Comment ${mongoComment._id.$oid} migrated with new ID: ${newComment.id}`);
        // }
        // console.log("Comments migration complete.");



        // CommentVote migrieren
        // const commentVotesData = JSON.parse(await fs.readFile(commentVotesFilePath, "utf-8"));
        // console.log(`Migrating ${commentVotesData.length} commentvotes...`);
        // for (const mongoCommentVote of commentVotesData) {
        //     await prisma.commentVote.create({
        //         data: {
        //             user: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoCommentVote.userId.$oid)
        //                 }
        //             },
        //             comment: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoCommentVote.commentId.$oid)
        //                 }
        //             },
        //             type: mongoCommentVote.type
        //         }
        //     });
        //     console.log(`CommentVote ${mongoCommentVote._id.$oid} migrated`);
        // }
        // console.log("CommentVotes migration complete.");

        // Votes migrieren
        const votesData = JSON.parse(await fs.readFile(votesFilePath, "utf-8"));
        console.log(`Migrating ${votesData.length} votes...`);
        for (const mongoVote of votesData) {
            await prisma.vote.create({
                data: {
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoVote.userId.$oid)
                        }
                    },
                    post: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoVote.postId.$oid)
                        }
                    },
                    type: mongoVote.type
                }
            });
            console.log(`Vote ${mongoVote._id.$oid} migrated`);
        }
        console.log("Votes migration complete.");


        // Consents migrieren
        const consentsData = JSON.parse(await fs.readFile(consentsFilePath, "utf-8"));
        console.log(`Migrating ${consentsData.length} consents...`);
        for (const mongoConsent of consentsData) {
            if(mongoConsent.userId) {
                await prisma.consent.create({
                    data: {
                        user: {
                            connect: {
                                id: mongoIdToPostgresIdMap.get(mongoConsent.userId.$oid)
                            }
                        },
                        anonymousId: mongoConsent.anonymousId,
                        ipHash: mongoConsent.ipHash,
                        consentGiven: mongoConsent.consentGiven,
                        consentType: mongoConsent.consentType,
                        createdAt: new Date(mongoConsent.createdAt.$date),
                        updatedAt: new Date(mongoConsent.updatedAt.$date)
                    }
                });
                console.log(`Consent ${mongoConsent._id.$oid} migrated`);
                continue;
            }

            await prisma.consent.create({
                data: {
                    anonymousId: mongoConsent.anonymousId,
                    ipHash: mongoConsent.ipHash,
                    consentGiven: mongoConsent.consentGiven,
                    consentType: mongoConsent.consentType,
                    createdAt: new Date(mongoConsent.createdAt.$date),
                    updatedAt: new Date(mongoConsent.updatedAt.$date)
                }
            });

            console.log(`Consent ${mongoConsent._id.$oid} migrated`);
        }
        console.log("Consents migration complete.");


        // ConversionLogs migrieren
        const conversionLogsData = JSON.parse(await fs.readFile(conversionLogsFilePath, "utf-8"));
        console.log(`Migrating ${conversionLogsData.length} conversionlogs...`);
        for (const mongoConversionLog of conversionLogsData) {
            await prisma.conversionLogs.create({
                data: {
                    createdAt: new Date(mongoConversionLog.createdAt.$date),
                    link: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoConversionLog.linkId.$oid)
                        }
                    },
                    event: mongoConversionLog.event,
                    ip: mongoConversionLog.ip,
                    fbc: mongoConversionLog.fbc,
                    fbp: mongoConversionLog.fbp,
                    country: mongoConversionLog.country,
                }
            });

            console.log(`ConversionLog ${mongoConversionLog._id.$oid} migrated`);
        }
        console.log("ConversionLogs migration complete.");



        // Course migrieren
        const coursesData = JSON.parse(await fs.readFile(coursesFilePath, "utf-8"));
        console.log(`Migrating ${coursesData.length} courses...`);
        for (const mongoCourse of coursesData) {
            const newCourse = await prisma.course.create({
                data: {
                    internalName: mongoCourse.internalName,
                    title: mongoCourse.title,
                    description: mongoCourse.description,
                    createdAt: new Date(mongoCourse.createdAt.$date),
                    updatedAt: new Date(mongoCourse.updatedAt.$date),
                    thumbnail: mongoCourse.thumbnail,
                    productLink: mongoCourse.productLink,
                    active: mongoCourse.active
                }
            });

            mongoIdToPostgresIdMap.set(mongoCourse._id.$oid || mongoCourse._id, newCourse.id);
            console.log(`Course ${mongoCourse.title} migrated with new ID: ${newCourse.id}`);
        }
        console.log("Courses migration complete.");


        // CourseToUsers migrieren
        const courseToUsersData = JSON.parse(await fs.readFile(courseToUsersFilePath, "utf-8"));
        console.log(`Migrating ${courseToUsersData.length} coursetousers...`);
        for (const mongoCourseToUser of courseToUsersData) {
            await prisma.courseToUsers.create({
                data: {
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoCourseToUser.userId.$oid)
                        }
                    },
                    course: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoCourseToUser.courseId.$oid)
                        }
                    }
                }
            });

            console.log(`CourseToUser ${mongoCourseToUser._id.$oid} migrated`);
        }
        console.log("CourseToUsers migration complete.");


        // CourseSections migrieren
        const courseSectionsData = JSON.parse(await fs.readFile(courseSectionsFilePath, "utf-8"));
        console.log(`Migrating ${courseSectionsData.length} coursesections...`);
        for (const mongoCourseSection of courseSectionsData) {
            const newCourseSection = await prisma.courseSection.create({
                data: {
                    title: mongoCourseSection.title,
                    course: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoCourseSection.courseId.$oid)
                        }
                    }
                }
            });

            mongoIdToPostgresIdMap.set(mongoCourseSection._id.$oid || mongoCourseSection._id, newCourseSection.id);
            console.log(`CourseSection ${mongoCourseSection.title} migrated with new ID: ${newCourseSection.id}`);
        }
        console.log("CourseSections migration complete.");


        // CourseVideos migrieren
        const courseVideosData = JSON.parse(await fs.readFile(courseVideosFilePath, "utf-8"));
        console.log(`Migrating ${courseVideosData.length} coursevideos...`);
        for (const mongoCourseVideo of courseVideosData) {
            const newCourseVideo = await prisma.courseVideo.create({
                data: {
                    title: mongoCourseVideo.title,
                    description: mongoCourseVideo.description,
                    createdAt: new Date(mongoCourseVideo.createdAt.$date),
                    updatedAt: new Date(mongoCourseVideo.updatedAt.$date),
                    thumbnail: mongoCourseVideo.thumbnail,
                    videoLink: mongoCourseVideo.videoLink,
                    section: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoCourseVideo.sectionId.$oid)
                        }
                    }
                }
            });

            mongoIdToPostgresIdMap.set(mongoCourseVideo._id.$oid || mongoCourseVideo._id, newCourseVideo.id);
            console.log(`CourseVideo ${mongoCourseVideo.title} migrated with new ID: ${newCourseVideo.id}`);
        }
        console.log("CourseVideos migration complete.");


        // CourseVideoToUsers migrieren
        // const courseVideosToUsersData = JSON.parse(await fs.readFile(courseVideoToUsersFilePath, "utf-8"));
        // console.log(`Migrating ${courseVideosToUsersData.length} coursevideostousers...`);
        // for (const mongoCourseVideoToUser of courseVideosToUsersData) {
        //     await prisma.courseVideosToUsers.create({
        //         data: {
        //             user: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoCourseVideoToUser.userId.$oid)
        //                 }
        //             },
        //             courseVideo: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoCourseVideoToUser.courseVideoId.$oid)
        //                 }
        //             }
        //         }
        //     });

        //     console.log(`CourseVideoToUser ${mongoCourseVideoToUser._id.$oid} migrated`);
        // }
        // console.log("CourseVideoToUsers migration complete.");


        // DataSaves migrieren
        const dataSavesData = JSON.parse(await fs.readFile(dataSavesFilePath, "utf-8"));
        console.log(`Migrating ${dataSavesData.length} datasaves...`);
        for (const mongoDataSave of dataSavesData) {
            await prisma.dataSaves.create({
                data: {
                    state: mongoDataSave.state,
                    name: mongoDataSave.name,
                    authCode: mongoDataSave.authCode,
                    accessToken: mongoDataSave.accessToken,
                    refreshToken: mongoDataSave.refreshToken,
                    scope: mongoDataSave.scope,
                    expiresIn: mongoDataSave.expiresIn,
                    tokenType: mongoDataSave.tokenType
                }
            });

            console.log(`DataSave ${mongoDataSave._id.$oid} migrated`);
        }
        console.log("DataSaves migration complete.");


        // LinkTrackings migrieren
        // const linkTrackingsData = JSON.parse(await fs.readFile(linkTrackingsFilePath, "utf-8"));
        // console.log(`Migrating ${linkTrackingsData.length} linktrackings...`);
        // for (const mongoLinkTracking of linkTrackingsData) {
        //     await prisma.linkTracking.create({
        //         data: {
        //             createdAt: new Date(mongoLinkTracking.createdAt.$date),
        //             updatedAt: new Date(mongoLinkTracking.updatedAt.$date),
        //             link: {
        //                 connect: {
        //                     id: mongoIdToPostgresIdMap.get(mongoLinkTracking.linkId.$oid)
        //                 }
        //             },
        //             actions: mongoLinkTracking.actions,
        //             event: mongoLinkTracking.event
        //         }
        //     });

        //     console.log(`LinkTracking ${mongoLinkTracking._id.$oid} migrated`);
        // }
        // console.log("LinkTrackings migration complete.");


        // Order migrieren
        const ordersData = JSON.parse(await fs.readFile(ordersFilePath, "utf-8"));
        console.log(`Migrating ${ordersData.length} orders...`);
        for (const mongoOrder of ordersData) {
            await prisma.order.create({
                data: {
                    digistoreOrderId: mongoOrder.digistoreOrderId,
                    productId: mongoOrder.productId,
                    productName: mongoOrder.productName,
                    customerEmail: mongoOrder.customerEmail,
                    firstName: mongoOrder.firstName,
                    lastName: mongoOrder.lastName,
                    billingType: mongoOrder.billingType,
                    paySequenceNo: mongoOrder.paySequenceNo,
                    amount: mongoOrder.amount,
                    currency: mongoOrder.currency,
                    status: mongoOrder.status,
                    isTestOrder: mongoOrder.isTestOrder,
                    createdAt: new Date(mongoOrder.createdAt.$date),
                    lastUpdated: new Date(mongoOrder.lastUpdated.$date)
                }
            });

            console.log(`Order ${mongoOrder._id.$oid} migrated`);
        }
        console.log("Orders migration complete.");


        // PlaylistAnalyse migrieren
        const playlistAnalyseData = JSON.parse(await fs.readFile(playlistAnalyseFilePath, "utf-8"));
        console.log(`Migrating ${playlistAnalyseData.length} playlistanalyse...`);
        for (const mongoPlaylistAnalyse of playlistAnalyseData) {
            await prisma.playlistAnalyse.create({
                data: {
                    user: {
                        connect: {
                            id: mongoIdToPostgresIdMap.get(mongoPlaylistAnalyse.userId.$oid)
                        }
                    },
                    name: mongoPlaylistAnalyse.name,
                    playlistId: mongoPlaylistAnalyse.playlistId
                }
            });

            console.log(`PlaylistAnalyse ${mongoPlaylistAnalyse._id.$oid} migrated`);
        }
        console.log("PlaylistAnalyse migration complete.");



        // Products migrieren
        const productsData = JSON.parse(await fs.readFile(productsFilePath, "utf-8"));
        console.log(`Migrating ${productsData.length} products...`);
        for (const mongoProduct of productsData) {
            await prisma.product.create({
                data: {
                    createdAt: new Date(mongoProduct.createdAt.$date),
                    updatedAt: new Date(mongoProduct.updatedAt.$date),
                    name: mongoProduct.name,
                    price: mongoProduct.price,
                    subText: mongoProduct.subText,
                    currency: mongoProduct.currency,
                    features: mongoProduct.features,
                    featured: mongoProduct.featured,
                    buttonText: mongoProduct.buttonText,
                    additionalFeatures: mongoProduct.additionalFeatures,
                    link: mongoProduct.link
                }
            });

            console.log(`Product ${mongoProduct._id.$oid} migrated`);
        }
        console.log("Products migration complete.");



        // RoadmapItem migrieren
        const roadmapItemsData = JSON.parse(await fs.readFile(roadmapItemsFilePath, "utf-8"));
        console.log(`Migrating ${roadmapItemsData.length} roadmapitems...`);
        for (const mongoRoadmapItem of roadmapItemsData) {
            await prisma.roadmapItem.create({
                data: {
                    title: mongoRoadmapItem.title,
                    description: mongoRoadmapItem.description,
                    status: mongoRoadmapItem.status,
                    category: mongoRoadmapItem.category,
                    votes: mongoRoadmapItem.votes,
                    createdAt: new Date(mongoRoadmapItem.createdAt.$date),
                    updatedAt: new Date(mongoRoadmapItem.updatedAt.$date),
                    targetDate: new Date(mongoRoadmapItem.targetDate.$date)
                }
            });

            console.log(`RoadmapItem ${mongoRoadmapItem._id.$oid} migrated`);
        }
        console.log("RoadmapItems migration complete.");


        // VerificationTokens migrieren
        const verificationTokenData = JSON.parse(await fs.readFile(verificationTokenFilePath, "utf-8"));
        console.log(`Migrating ${verificationTokenData.length} verificationtokens...`);
        for (const mongoVerificationToken of verificationTokenData) {
            await prisma.verificationToken.create({
                data: {
                    identifier: mongoVerificationToken.identifier,
                    token: mongoVerificationToken.token,
                    expires: new Date(mongoVerificationToken.expires.$date)
                }
            });

            console.log(`VerificationToken ${mongoVerificationToken._id.$oid} migrated`);
        }
        console.log("VerificationTokens migration complete.");



        // Whitelist migrieren
        const whitelistData = JSON.parse(await fs.readFile(whitelistsFilePath, "utf-8"));
        console.log(`Migrating ${whitelistData.length} whitelists...`);
        for (const mongoWhitelist of whitelistData) {
            await prisma.whitelist.create({
                data: {
                    name: mongoWhitelist.name,
                    ip: mongoWhitelist.ip
                }
            });

            console.log(`Whitelist ${mongoWhitelist._id.$oid} migrated`);
        }
        console.log("Whitelists migration complete.");


        console.log("All data migration completed successfully!");
    } catch (error) {
        console.error("Data migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateData().then(() => console.log('MIGRATION DONE')).catch((err) => console.error(err));